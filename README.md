## 🚗 OSRM Backend + Frontend Docker (Indonesia Map)

Setup Open Source Routing Machine (OSRM) Backend + Frontend untuk kebutuhan routing/trip monitoring realtime menggunakan peta Indonesia dengan dukungan development environment.

### ✅ Fitur

- 🗺️ **Peta Indonesia** (Geofabrik) dengan data terlengkap
- 🚀 **OSRM Backend** (REST API Routing) dengan health checks
- 📍 **Nominatim Geocoding** untuk pencarian alamat
- ♻️ **Multi-thread support** sesuai spesifikasi server
- 🔄 **Auto generate** `.osrm` dari `.osm.pbf`
- 📦 **Persistent volumes** untuk data yang aman
- 🛡️ **Health monitoring** dan error handling
- 🌐 **Apache reverse proxy** ready untuk production

---

### 📁 Struktur Project

```
project-osrm/
│
├── data/                              # OSRM data files
│   └── indonesia-latest.osm.pbf
├── nominatim-data/                    # Nominatim data files
│   └── indonesia-latest.osm.pbf
├── docker-compose-osrm.yml           # OSRM backend service
├── docker-compose.nominatim.yml      # Nominatim service
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

Download peta Indonesia untuk OSRM dan Nominatim:

```bash
# Buat direktori data
mkdir -p data nominatim-data

# Download peta Indonesia (sekitar 1.5GB)
wget http://download.geofabrik.de/asia/indonesia-latest.osm.pbf -P ./data
cp ./data/indonesia-latest.osm.pbf ./nominatim-data/
```

---

### 3. Jalankan Services

#### 🚗 OSRM Backend

```bash
# Start OSRM backend
docker-compose -f docker-compose-osrm.yml up -d

# Monitor logs
docker-compose -f docker-compose-osrm.yml logs -f osrm-backend
```

#### 📍 Nominatim Geocoding (Optional)

```bash
# Start Nominatim (import akan memakan waktu lama)
docker-compose -f docker-compose.nominatim.yml up -d
```

---

### 🎯 Akses Services

| Service                  | URL                        | Description                    |
| ------------------------ | -------------------------- | ------------------------------ |
| **OSRM Backend**         | http://localhost:5000      | REST API untuk routing         |
| **Nominatim API**        | http://localhost:8080      | Geocoding & reverse geocoding  |

### 🌐 Production Access (dengan Apache Proxy)

| Service                  | URL                        | Description                    |
| ------------------------ | -------------------------- | ------------------------------ |
| **Public Frontend**      | https://telematics.biforst.id | Web interface untuk routing |
| **OSRM API**            | https://telematics.biforst.id/api | REST API routing via proxy |

---

### External PostgreSQL
```
docker run -it --rm \
  -e PBF_URL=https://download.geofabrik.de/europe/monaco-latest.osm.pbf \
  -e NOMINATIM_TOKENIZER=icu \
  -e NOMINATIM_DATABASE_DSN="pgsql:dbname=nominatim;hostaddr=192.168.0.3;user=my_user;password=my_pass" \
  -e PGHOSTADDR=192.168.0.3 \
  -e PGDATABASE=nominatim \
  -e PGUSER=my_user \
  -e PGPASSWORD=my_pass \
  -p 8080:8080 \
  --name nominatim \
  mediagis/nominatim:4.0-2a43ad71ad58d3b86f0b23a535b84f71f68a53ab
```

### 🔧 Apache Proxy Configuration

Untuk mengakses OSRM via domain public, setup Apache proxy:

```apache
#PROXY-START/
<IfModule mod_proxy.c>
    ProxyRequests Off
    SSLProxyEngine on
    
    # OSRM Backend API
    ProxyPass /api/ http://127.0.0.1:5000/
    ProxyPassReverse /api/ http://127.0.0.1:5000/
    
    # Frontend (jika ada custom frontend)
    ProxyPass / http://127.0.0.1:9966/
    ProxyPassReverse / http://127.0.0.1:9966/
</IfModule>
#PROXY-END/
```

#### Testing Proxy Setup

```bash
# Test OSRM API via proxy
curl "https://telematics.biforst.id/api/nearest/v1/driving/106.8456,-6.2088"

# Test direct backend
curl "http://localhost:5000/nearest/v1/driving/106.8456,-6.2088"
```

---

### 🌐 Contoh API Usage

#### OSRM Routing API

```http
# Basic route calculation
GET http://localhost:5000/route/v1/driving/106.8456,-6.2088;106.8650,-6.1751?overview=full&geometries=geojson

# Nearest road point
GET http://localhost:5000/nearest/v1/driving/106.8456,-6.2088

# Distance table
GET http://localhost:5000/table/v1/driving/106.8456,-6.2088;106.8650,-6.1751
```

#### Nominatim Geocoding API

```http
# Search by address
GET http://localhost:8080/search?q=Jakarta&format=json

# Reverse geocoding
GET http://localhost:8080/reverse?lat=-6.2088&lon=106.8456&format=json
```

---

### ⚙️ Configuration & Tips

#### Performance Optimization

- 🖥️ **CPU**: Minimum 4 cores, recommended 8+ cores
- 💾 **RAM**: Minimum 8GB, recommended 16GB+ 
- 💿 **Storage**: SSD recommended untuk import cepat
- 🔧 **Threads**: Adjust `OSRM_THREADS` sesuai CPU cores

#### Data Management

- 📦 **Volumes persistent**: Data tidak hilang saat `docker-compose down`
- 🔄 **Hapus volume**: `docker-compose down -v` (⚠️ data akan hilang)
- 📊 **Monitor space**: Import Nominatim butuh ~50GB disk

#### Production Deployment

- 🔒 **Firewall**: Buka port 5000, 8080 (internal), 80, 443 (public)
- 🌐 **Public access**: Gunakan Apache/Nginx reverse proxy
- 🔐 **Security**: Setup SSL certificate untuk HTTPS
- 📈 **Monitoring**: Setup health checks dan logging
- ⚡ **Performance**: Gunakan CDN untuk static assets

---

### 🚀 Quick Commands

```bash
# Start backend service
docker-compose -f docker-compose-osrm.yml up -d

# Start geocoding service
docker-compose -f docker-compose.nominatim.yml up -d

# Stop services
docker-compose -f docker-compose-osrm.yml down
docker-compose -f docker-compose.nominatim.yml down

# View logs
docker-compose -f docker-compose-osrm.yml logs -f osrm-backend
docker-compose -f docker-compose.nominatim.yml logs -f nominatim

# Restart services
docker-compose -f docker-compose-osrm.yml restart osrm-backend
docker-compose -f docker-compose.nominatim.yml restart nominatim

# Check status
docker-compose -f docker-compose-osrm.yml ps
```

---

### 🐛 Troubleshooting

#### Common Issues

1. **Port already in use**:
   ```bash
   sudo netstat -tlnp | grep :5000
   sudo kill -9 <PID>
   ```

2. **PBF file not found**:
   - Pastikan file `indonesia-latest.osm.pbf` ada di folder `data/` dan `nominatim-data/`

3. **Import Nominatim gagal**:
   ```bash
   # Reset Nominatim data
   docker-compose -f docker-compose.nominatim.yml down -v
   rm -rf nominatim-data/.import_complete
   ```

4. **OSRM processing lambat**:
   - Gunakan SSD storage
   - Increase thread count
   - Monitor RAM usage

#### Health Checks

```bash
# Check OSRM health
curl http://localhost:5000/nearest/v1/driving/106.8456,-6.2088

# Check Nominatim health  
curl http://localhost:8080/search?q=Jakarta&format=json&limit=1
```

---

### 📌 Development Notes

#### Preprocessing Manual (Optional)

Jika ingin preprocessing di luar container:

```bash
docker run -t -v $(pwd)/data:/data osrm/osrm-backend osrm-extract -p /opt/car.lua /data/indonesia-latest.osm.pbf
docker run -t -v $(pwd)/data:/data osrm/osrm-backend osrm-partition /data/indonesia-latest.osrm  
docker run -t -v $(pwd)/data:/data osrm/osrm-backend osrm-customize /data/indonesia-latest.osrm
```

#### Custom Profiles

Edit profile routing di `osrm-extract`:
- Car: `/opt/car.lua`
- Bicycle: `/opt/bicycle.lua` 
- Foot: `/opt/foot.lua`

---

### 💬 License & Credits

- 📜 **OSRM**: Open Source Routing Machine - [github.com/Project-OSRM](https://github.com/Project-OSRM/osrm-backend)
- 🗺️ **Map Data**: Indonesia dari Geofabrik - ODbL License
- 📍 **Nominatim**: OpenStreetMap Geocoder - [github.com/osm-search/Nominatim](https://github.com/osm-search/Nominatim)
- 🐳 **Docker Images**: 
  - `osrm/osrm-backend`
  - `mediagis/nominatim`
  - `postgis/postgis`

---

### 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Test dengan production environment
4. Submit pull request

Untuk custom environment atau reverse proxy setup, silakan buat issue atau contact maintainer.

### 📞 Support

Untuk bantuan setup production atau konfigurasi khusus:
- 📧 Email support
- 🐛 GitHub Issues
- 📖 Documentation wiki
