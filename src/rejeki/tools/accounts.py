from rejeki.database import Database


def add_account(db: Database, name: str, type: str, initial_balance: float = 0) -> dict:
    id = db.execute(
        "INSERT INTO accounts (name, type, balance) VALUES (?, ?, ?)",
        (name, type, initial_balance),
    )
    return {"id": id, "name": name, "type": type, "balance": initial_balance}


def get_accounts(db: Database) -> dict:
    rows = db.fetchall("SELECT id, name, type, balance FROM accounts ORDER BY name")
    total = sum(r["balance"] for r in rows)
    return {"accounts": rows, "total_balance": total}


def edit_account(db: Database, id: int, name: str | None = None, type: str | None = None) -> dict:
    account = db.fetchone("SELECT * FROM accounts WHERE id = ?", (id,))
    if not account:
        raise ValueError(f"Rekening id={id} tidak ditemukan")

    new_name = name or account["name"]
    new_type = type or account["type"]
    db.execute("UPDATE accounts SET name = ?, type = ? WHERE id = ?", (new_name, new_type, id))
    return {"id": id, "name": new_name, "type": new_type, "balance": account["balance"]}


def update_balance(db: Database, id: int, balance: float) -> dict:
    account = db.fetchone("SELECT * FROM accounts WHERE id = ?", (id,))
    if not account:
        raise ValueError(f"Rekening id={id} tidak ditemukan")

    db.execute("UPDATE accounts SET balance = ? WHERE id = ?", (balance, id))
    return {"id": id, "name": account["name"], "type": account["type"], "balance": balance}


def delete_account(db: Database, id: int) -> dict:
    account = db.fetchone("SELECT * FROM accounts WHERE id = ?", (id,))
    if not account:
        raise ValueError(f"Rekening id={id} tidak ditemukan")

    db.execute("DELETE FROM accounts WHERE id = ?", (id,))
    return {"deleted_id": id, "name": account["name"]}
