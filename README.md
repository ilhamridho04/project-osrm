## 🚗 OSRM Backend + Frontend Docker (Indonesia Map)

Setup Open Source Routing Machine (OSRM) Backend + Frontend untuk kebutuhan routing/trip monitoring realtime menggunakan peta Indonesia.

### ✅ Fitur

- 🗺️ Peta Indonesia (Geofabrik)
- 🚀 OSRM Backend (REST API Routing)
- 🌐 OSRM Frontend (Browser Map Viewer)
- ♻️ Support multi-thread sesuai spesifikasi server
- 🔧 Auto generate `.osrm` dari `.osm.pbf`

---

### 📁 Struktur Project

```
project-osrm/
│
├── data/
│   └── indonesia-latest.osm.pbf
├── docker-compose.yml
└── README.md
```

---

### 1. Clone Project

```bash
git clone <repo-url> project-osrm
cd project-osrm
```

---

### 2. Download Peta Indonesia

```bash
mkdir -p data
wget http://download.geofabrik.de/asia/indonesia-latest.osm.pbf -P ./data
```

---

### 3. Preprocessing Peta Manual (disarankan)

```bash
docker run -t -v $(pwd)/data:/data osrm/osrm-backend osrm-extract -p /opt/car.lua /data/indonesia-latest.osm.pbf
docker run -t -v $(pwd)/data:/data osrm/osrm-backend osrm-partition /data/indonesia-latest.osrm
docker run -t -v $(pwd)/data:/data osrm/osrm-backend osrm-customize /data/indonesia-latest.osrm
```

---

### 4. Jalankan OSRM Backend + Frontend

```bash
docker-compose up -d
```

---

### 🎯 Akses

| Service        | URL                        |
| -------------- | ------------------------- |
| OSRM Backend   | http://localhost:5000      |
| OSRM Frontend  | http://localhost:9966      |

---

### Contoh API Route

```http
GET http://localhost:5000/route/v1/driving/108.4756,-6.9820;108.4760,-6.9849?overview=false
```

---

### ⚙️ Catatan Penting

- Pastikan port 5000 dan 9966 dibuka di firewall.
- Untuk server publik, ganti `localhost` dengan IP publik.
- Untuk optimasi kecepatan: gunakan SSD dan banyak core.
- Backend bisa multi-thread (`--threads` di compose).

---

### 📌 Development Quick Start (Fast Setup)

Cara cepat:

```bash
docker-compose up -d
```

Auto generate `.osrm` saat pertama kali jalan.

---

### 💬 Lisensi

- Peta Indonesia dari Geofabrik, open-source lisensi ODbL.
- Untuk custom `.env` atau nginx reverse proxy, silakan kontak.
