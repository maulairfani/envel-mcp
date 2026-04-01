# Rejeki

AI personal finance agent berbasis YNAB (envelope budgeting). Ngobrol langsung dengan Claude Desktop untuk catat transaksi, cek budget, dan tanya "bisa afford ini gak?" — tanpa buka-buka spreadsheet.

## Arsitektur

```
Claude Desktop ──── MCP Server (FastMCP) ──── Turso DB (per-user)
                         │
                    GitHub OAuth
                         │
              Platform Backend (FastAPI)
                         │
              Platform Frontend (React)
```

| Komponen | Stack | Port |
|---|---|---|
| MCP Server | Python + FastMCP | 8000 |
| Platform Backend | FastAPI | 8001 |
| Platform Frontend | React + Tailwind | 80 |

---

## Prasyarat

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- Akun [Turso](https://turso.tech) — untuk database
- Akun [GitHub](https://github.com) — untuk OAuth
- [Claude Desktop](https://claude.ai/download)

---

## Setup

### 1. Clone repo

```bash
git clone <repo-url> rejeki
cd rejeki
```

### 2. Buat GitHub OAuth App

1. Buka **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Isi form:
   - **Application name:** Rejeki (atau apa saja)
   - **Homepage URL:** `http://localhost`
   - **Authorization callback URL:** `http://localhost:8000/auth/callback`
3. Klik **Register application**
4. Catat **Client ID** dan generate **Client Secret**

> Kalau mau pakai platform frontend juga, tambahkan callback kedua: `http://localhost/auth/callback`

### 3. Buat Turso database untuk platform

Database ini menyimpan data user (akun GitHub + kredensial Turso per-user).

1. Buka [turso.tech](https://turso.tech) → Sign up / Login
2. Klik **Create database** → nama: `rejeki-platform`
3. Buka database → tab **Connect**
4. Catat **Database URL** (`libsql://...`) dan **Auth Token**

### 4. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Platform database (Turso)
PLATFORM_TURSO_URL=libsql://rejeki-platform-<username>.turso.io
PLATFORM_TURSO_TOKEN=your_platform_token

# URL publik MCP server
MCP_BASE_URL=http://localhost:8000

# JWT secret (generate random string)
JWT_SECRET=

# URL frontend
FRONTEND_URL=http://localhost
```

Generate `JWT_SECRET`:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 5. Jalankan dengan Docker Compose

```bash
docker compose up -d
```

Verifikasi semua container jalan:

```bash
docker compose ps
```

---

## Hubungkan ke Claude Desktop

### Buat user database (Turso)

Setiap user butuh database Turso sendiri:

1. Buka [turso.tech](https://turso.tech) → **Create database** → nama bebas (misal `rejeki-irfani`)
2. Buka database → tab **Connect** → catat **Database URL** dan **Auth Token**

### Daftarkan database di platform

1. Buka `http://localhost` di browser
2. Login dengan GitHub
3. Pergi ke **Settings**
4. Masukkan Turso URL dan token yang baru dibuat
5. Klik **Save**

### Tambahkan MCP server ke Claude Desktop

Edit file konfigurasi Claude Desktop:

- **Windows:** `%AppData%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rejeki": {
      "type": "http",
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

Restart Claude Desktop. Saat pertama kali terkoneksi, Claude Desktop akan meminta login GitHub — ikuti alurnya.

Setelah terhubung, `rejeki` akan muncul di daftar Connectors.

---

## Cara pakai

Ngobrol langsung dengan Claude di Claude Desktop:

```
"Catat pengeluaran makan siang 35rb dari BCA"
"Berapa saldo BCA sekarang?"
"Budget makan bulan ini masih berapa?"
"Bisa afford beli headphone 500rb gak?"
"Tampilkan ringkasan pengeluaran bulan ini"
```

---

## Development (tanpa Docker)

### MCP Server

```bash
cd mcp
pip install -e .

# Set env vars dulu
export GITHUB_CLIENT_ID=...
export GITHUB_CLIENT_SECRET=...
export MCP_BASE_URL=http://localhost:8000
export PLATFORM_TURSO_URL=...
export PLATFORM_TURSO_TOKEN=...

python -m rejeki.server
```

### Platform Backend

```bash
cd platform/backend
pip install -r requirements.txt

# Set env vars (sama seperti di atas, tambah JWT_SECRET dan FRONTEND_URL)
uvicorn main:app --reload --port 8001
```

### Platform Frontend

```bash
cd platform/frontend
npm install
npm run dev   # jalan di http://localhost:5173
```

---

## Struktur Proyek

```
rejeki/
├── docker-compose.yml
├── .env.example
├── mcp/                    # MCP Server
│   ├── rejeki/
│   │   ├── server.py       # FastMCP app + tools
│   │   ├── database.py     # koneksi Turso per-user
│   │   ├── schema.sql      # skema DB keuangan
│   │   └── tools/          # implementasi tiap tool
│   └── pyproject.toml
└── platform/
    ├── backend/            # FastAPI (auth + settings API)
    └── frontend/           # React dashboard
```
