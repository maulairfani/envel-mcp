import contextlib
import os

import httpx
from dotenv import load_dotenv
from mcp.server.auth.provider import AccessToken, TokenVerifier
from mcp.server.auth.settings import AuthSettings
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from pydantic import AnyHttpUrl
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import PlainTextResponse
from starlette.routing import Mount, Route

from rejeki.database import Database
from rejeki.deps import _db_path, get_user_db
from rejeki.tools import accounts, analytics, envelopes, scheduled, transactions

load_dotenv()

# ─── CONFIG ──────────────────────────────────────────────────────────────────

AS_BASE_URL   = os.environ.get("AS_BASE_URL",    "https://maulairfani.my.id/rejeki/auth")
MCP_BASE_URL  = os.environ.get("MCP_BASE_URL",   "https://maulairfani.my.id/rejeki/mcp")
INTROSPECT_URL = os.environ.get("INTROSPECT_URL", "http://127.0.0.1:9004/introspect")

_ALLOWED_HOSTS = os.environ.get(
    "MCP_ALLOWED_HOSTS",
    "maulairfani.my.id,localhost:*,127.0.0.1:*,[::1]:*",
).split(",")


# ─── TOKEN VERIFIER ──────────────────────────────────────────────────────────

class RejekiTokenVerifier(TokenVerifier):
    """Validates OAuth tokens via introspection and injects per-user db_path."""

    async def verify_token(self, token: str) -> AccessToken | None:
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                resp = await client.post(
                    INTROSPECT_URL,
                    data={"token": token},
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
            except Exception:
                return None

        if resp.status_code != 200:
            return None

        data = resp.json()
        if not data.get("active"):
            return None

        db = data.get("db", os.path.expanduser("~/rejeki.db"))
        _db_path.set(db)

        return AccessToken(
            token=token,
            client_id=data.get("username", data.get("client_id", "unknown")),
            scopes=data.get("scope", "").split(),
            expires_at=data.get("exp"),
        )


class TestTokenVerifier(TokenVerifier):
    """Static single-token verifier for local development / evaluation."""

    def __init__(self, token: str):
        self._token = token

    async def verify_token(self, token: str) -> AccessToken | None:
        if token != self._token:
            return None
        # _db_path falls back to TEST_DB env var in get_user_db()
        return AccessToken(
            token=token,
            client_id="test-user-eval-001",
            scopes=["rejeki"],
        )


# ─── MCP SERVER ──────────────────────────────────────────────────────────────

_test_token = os.environ.get("TEST_TOKEN")
if _test_token:
    _token_verifier: TokenVerifier = TestTokenVerifier(_test_token)
else:
    _token_verifier = RejekiTokenVerifier()

mcp = FastMCP(
    "rejeki",
    stateless_http=True,
    json_response=True,
    streamable_http_path="/",
    token_verifier=_token_verifier,
    auth=AuthSettings(
        issuer_url=AnyHttpUrl(AS_BASE_URL),
        resource_server_url=AnyHttpUrl(MCP_BASE_URL),
        required_scopes=["rejeki"],
    ),
    transport_security=TransportSecuritySettings(
        enable_dns_rebinding_protection=True,
        allowed_hosts=_ALLOWED_HOSTS,
        allowed_origins=[
            "https://maulairfani.my.id",
            "http://localhost:*",
            "http://127.0.0.1:*",
        ],
    ),
    instructions=(
        "Tools untuk aplikasi personal envelope-budgeting. "
        "Melacak rekening, kategori envelope, transaksi, dan aset. "
        "Format tanggal: YYYY-MM-DD. Nominal dalam IDR."
    ),
)


# ---------------------------------------------------------------------------
# Accounts
# ---------------------------------------------------------------------------

@mcp.tool()
def finance_add_account(name: str, type: str, initial_balance: float = 0) -> dict:
    """Tambah rekening baru. type: bank | ewallet | cash"""
    with get_user_db() as db:
        return accounts.add_account(db, name, type, initial_balance)


@mcp.tool()
def finance_get_accounts() -> dict:
    """List semua rekening beserta saldo dan total keseluruhan."""
    with get_user_db() as db:
        return accounts.get_accounts(db)


@mcp.tool()
def finance_edit_account(id: int, name: str | None = None, type: str | None = None) -> dict:
    """Edit nama atau tipe rekening."""
    with get_user_db() as db:
        return accounts.edit_account(db, id, name, type)


@mcp.tool()
def finance_update_balance(id: int, balance: float) -> dict:
    """Set saldo rekening langsung (rekonsiliasi manual)."""
    with get_user_db() as db:
        return accounts.update_balance(db, id, balance)


@mcp.tool()
def finance_delete_account(id: int) -> dict:
    """Hapus rekening."""
    with get_user_db() as db:
        return accounts.delete_account(db, id)


# ---------------------------------------------------------------------------
# Envelope groups
# ---------------------------------------------------------------------------

@mcp.tool()
def finance_get_groups() -> list:
    """List semua kelompok envelope."""
    with get_user_db() as db:
        return envelopes.get_groups(db)


@mcp.tool()
def finance_add_group(name: str, sort_order: int = 0) -> dict:
    """Tambah kelompok envelope baru."""
    with get_user_db() as db:
        return envelopes.add_group(db, name, sort_order)


# ---------------------------------------------------------------------------
# Envelopes — CRUD + budget view
# ---------------------------------------------------------------------------

@mcp.tool()
def finance_get_envelopes(period: str | None = None) -> dict:
    """
    Tampilkan semua envelope.
    Income sources: referensi untuk mencatat pemasukan.
    Expense envelopes per kelompok: carryover, assigned, activity, available, target.
    period format YYYY-MM (default bulan ini).
    """
    with get_user_db() as db:
        return envelopes.get_envelopes(db, period)


@mcp.tool()
def finance_add_envelope(name: str, type: str, icon: str | None = None, group_id: int | None = None) -> dict:
    """
    Tambah envelope baru. type: income | expense.
    group_id untuk expense (opsional — tanpa group masuk kelompok 'Lainnya').
    """
    with get_user_db() as db:
        return envelopes.add_envelope(db, name, type, icon, group_id)


@mcp.tool()
def finance_edit_envelope(
    id: int,
    name: str | None = None,
    icon: str | None = None,
    group_id: int | None = None,
) -> dict:
    """Edit envelope. Isi hanya field yang mau diubah."""
    with get_user_db() as db:
        return envelopes.edit_envelope(db, id, name, icon, group_id)


@mcp.tool()
def finance_delete_envelope(id: int) -> dict:
    """Hapus envelope beserta semua data budgetnya."""
    with get_user_db() as db:
        return envelopes.delete_envelope(db, id)


@mcp.tool()
def finance_set_target(
    envelope_id: int,
    target_type: str,
    target_amount: float | None = None,
    target_deadline: str | None = None,
) -> dict:
    """
    Set funding target pada envelope expense.
    target_type: 'monthly' — assign X setiap bulan.
                 'goal'    — kumpulkan X sampai deadline.
    target_deadline format YYYY-MM-DD, hanya untuk goal.
    """
    with get_user_db() as db:
        return envelopes.set_target(db, envelope_id, target_type, target_amount, target_deadline)


@mcp.tool()
def finance_assign_to_envelope(envelope_id: int, amount: float, period: str | None = None) -> dict:
    """
    Assign uang dari Ready to Assign ke envelope.
    Ini operasi inti Rejeki: 'give every rupiah a job'.
    Memanggil ini lagi pada period yang sama akan menimpa assigned sebelumnya.
    period format YYYY-MM (default bulan ini).
    """
    with get_user_db() as db:
        return envelopes.assign_to_envelope(db, envelope_id, amount, period)


@mcp.tool()
def finance_move_money(
    from_envelope_id: int,
    to_envelope_id: int,
    amount: float,
    period: str | None = None,
) -> dict:
    """
    Pindahkan uang antar envelope dalam satu period.
    Dipakai saat overspend di satu envelope dan perlu ditutup dari envelope lain.
    period format YYYY-MM (default bulan ini).
    """
    with get_user_db() as db:
        return envelopes.move_money(db, from_envelope_id, to_envelope_id, amount, period)


# ---------------------------------------------------------------------------
# Transactions
# ---------------------------------------------------------------------------

@mcp.tool()
def finance_add_transaction(
    amount: float,
    type: str,
    account_id: int,
    envelope_id: int | None = None,
    to_account_id: int | None = None,
    payee: str | None = None,
    memo: str | None = None,
    transaction_date: str | None = None,
) -> dict:
    """
    Catat transaksi dengan ID eksplisit. Gunakan ini hanya untuk:
    - income dan transfer (bukan expense sehari-hari)
    - saat perlu kontrol penuh atas account_id / envelope_id / tanggal

    Untuk expense sehari-hari, gunakan finance_quick_add — lebih cepat dan tidak perlu ID.
    type: income | expense | transfer.
    transaction_date format YYYY-MM-DD (default hari ini).
    """
    with get_user_db() as db:
        return transactions.add_transaction(
            db, amount, type, account_id, envelope_id, to_account_id, payee, memo, transaction_date
        )


@mcp.tool()
def finance_get_transactions(
    account_id: int | None = None,
    envelope_id: int | None = None,
    type: str | None = None,
    payee: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    limit: int = 50,
) -> list:
    """
    Query transaksi. Semua filter opsional dan bisa dikombinasikan.
    payee: partial match (misal 'Grab' cocok dengan 'GrabFood').
    """
    with get_user_db() as db:
        return transactions.get_transactions(db, account_id, envelope_id, type, payee, date_from, date_to, limit)


@mcp.tool()
def finance_edit_transaction(
    id: int,
    amount: float | None = None,
    type: str | None = None,
    account_id: int | None = None,
    envelope_id: int | None = None,
    to_account_id: int | None = None,
    payee: str | None = None,
    memo: str | None = None,
    transaction_date: str | None = None,
) -> dict:
    """Edit transaksi yang sudah ada. Isi hanya field yang mau diubah."""
    with get_user_db() as db:
        return transactions.edit_transaction(
            db, id, amount, type, account_id, envelope_id, to_account_id, payee, memo, transaction_date
        )


@mcp.tool()
def finance_delete_transaction(id: int) -> dict:
    """Hapus transaksi dan balikkan efeknya ke saldo rekening."""
    with get_user_db() as db:
        return transactions.delete_transaction(db, id)


# ---------------------------------------------------------------------------
# Scheduled transactions
# ---------------------------------------------------------------------------

@mcp.tool()
def finance_add_scheduled_transaction(
    amount: float,
    type: str,
    account_id: int,
    scheduled_date: str,
    envelope_id: int | None = None,
    to_account_id: int | None = None,
    payee: str | None = None,
    memo: str | None = None,
    recurrence: str = "once",
) -> dict:
    """
    Jadwalkan transaksi di masa depan.
    recurrence: once | weekly | monthly | yearly.
    scheduled_date format YYYY-MM-DD.
    """
    with get_user_db() as db:
        return scheduled.add_scheduled_transaction(
            db, amount, type, account_id, scheduled_date, envelope_id, to_account_id, payee, memo, recurrence
        )


@mcp.tool()
def finance_get_scheduled_transactions(include_inactive: bool = False) -> list:
    """List transaksi terjadwal, termasuk field days_until (berapa hari lagi)."""
    with get_user_db() as db:
        return scheduled.get_scheduled_transactions(db, include_inactive)


@mcp.tool()
def finance_approve_scheduled_transaction(id: int) -> dict:
    """
    Eksekusi scheduled transaction sebagai transaksi nyata.
    Jika recurring, otomatis jadwalkan ke occurrence berikutnya.
    """
    with get_user_db() as db:
        return scheduled.approve_scheduled_transaction(db, id)


@mcp.tool()
def finance_skip_scheduled_transaction(id: int) -> dict:
    """
    Lewati occurrence ini tanpa mencatat transaksi.
    Jika recurring, maju ke occurrence berikutnya.
    """
    with get_user_db() as db:
        return scheduled.skip_scheduled_transaction(db, id)


@mcp.tool()
def finance_delete_scheduled_transaction(id: int) -> dict:
    """Hapus scheduled transaction sepenuhnya."""
    with get_user_db() as db:
        return scheduled.delete_scheduled_transaction(db, id)


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

@mcp.tool()
def finance_get_onboarding_status() -> dict:
    """
    Cek status onboarding: rekening, targets, envelope assignment, RTA.
    Panggil ini di awal setiap sesi baru.
    """
    with get_user_db() as db:
        return analytics.get_onboarding_status(db)


@mcp.tool()
def finance_get_ready_to_assign(period: str | None = None) -> dict:
    """
    Hitung Ready to Assign = total saldo rekening − total available semua envelope.
    Target: nol. Setiap rupiah harus punya tugas.
    """
    with get_user_db() as db:
        return analytics.get_ready_to_assign(db, period)


@mcp.tool()
def finance_get_age_of_money() -> dict:
    """
    Hitung Age of Money: rata-rata berapa hari uang duduk sebelum dipakai.
    Dihitung FIFO. Target: 30+ hari.
    """
    with get_user_db() as db:
        return analytics.get_age_of_money(db)


@mcp.tool()
def finance_get_summary(period: str | None = None) -> dict:
    """Ringkasan bulanan: income, expense, net, breakdown per envelope. period: YYYY-MM."""
    with get_user_db() as db:
        return analytics.get_summary(db, period)


@mcp.tool()
def finance_get_spending_trend(envelope_id: int | None = None, months: int = 3) -> list:
    """Tren pengeluaran per envelope, N bulan ke belakang."""
    with get_user_db() as db:
        return analytics.get_spending_trend(db, envelope_id, months)


# ---------------------------------------------------------------------------
# ASGI app
# ---------------------------------------------------------------------------

@contextlib.asynccontextmanager
async def lifespan(app):
    async with mcp.session_manager.run():
        yield


app = Starlette(
    lifespan=lifespan,
    routes=[
        Route("/health", lambda r: PlainTextResponse("ok")),
        Mount("/mcp", app=mcp.streamable_http_app()),
    ],
)


def main():
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(
        "rejeki.server:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        proxy_headers=True,
        forwarded_allow_ips="*",
    )


if __name__ == "__main__":
    main()
