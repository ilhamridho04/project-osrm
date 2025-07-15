# OSRM Frontend Development

Frontend kustom untuk OSRM dengan hot reload development.

## Fitur

- 🗺️ Interactive map dengan Leaflet
- 🚗 Route calculation menggunakan OSRM backend
- 🔄 Hot reload untuk development
- 📱 Responsive design
- 🎨 Modern UI dengan gradient styling

## Development

1. **Start OSRM Backend dulu:**
   ```bash
   docker-compose -f docker-compose-osrm.yml up osrm-backend
   ```

2. **Start Frontend Development:**
   ```bash
   docker-compose -f docker-compose-osrm.yml up osrm-frontend
   ```

3. **Start Nominatim Geocoding (Optional):**
   ```bash
   docker-compose -f docker-compose.nominatim.yml up -d
   ```

4. **Akses aplikasi:**
   - Development Frontend: http://localhost:9966
   - Original Frontend: http://localhost:9968
   - Hot Reload Port: http://localhost:9967
   - Nominatim API: http://localhost:8080

## Modifikasi via VSCode

File yang bisa dimodifikasi:
- `src/index.html` - UI dan layout
- `src/app.js` - Logic aplikasi
- `src/styles.css` - Custom CSS (opsional)

Setiap perubahan akan otomatis ter-reload di browser.

## Structure

```
frontend/
├── src/
│   ├── index.html      # Main HTML file
│   ├── app.js          # Application logic
│   └── styles.css      # Custom styles (optional)
├── public/             # Static assets
├── Dockerfile          # Development container
├── package.json        # Dependencies
└── webpack.config.js   # Build configuration
```

## Integrasi dengan Nominatim

Frontend ini dapat diintegrasikan dengan Nominatim untuk geocoding:

### Setup Nominatim

1. **Pastikan file PBF tersedia:**
   ```bash
   # Copy file PBF ke folder nominatim-data
   cp ./data/indonesia-latest.osm.pbf ./nominatim-data/
   ```

2. **Start Nominatim service:**
   ```bash
   docker-compose -f docker-compose.nominatim.yml up -d
   ```

3. **Wait for import** (proses import memakan waktu lama, bisa 2-6 jam):
   ```bash
   # Monitor progress
   docker-compose -f docker-compose.nominatim.yml logs -f nominatim
   ```

### API Integration Examples

#### Geocoding (Address to Coordinates)
```javascript
// Search address
const searchAddress = async (query) => {
  const response = await fetch(`http://localhost:8080/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
  return await response.json();
};

// Usage
const results = await searchAddress("Jakarta Pusat");
```

#### Reverse Geocoding (Coordinates to Address)
```javascript
// Get address from coordinates
const reverseGeocode = async (lat, lng) => {
  const response = await fetch(`http://localhost:8080/reverse?lat=${lat}&lon=${lng}&format=json`);
  return await response.json();
};

// Usage
const address = await reverseGeocode(-6.2088, 106.8456);
```

## Complete Development Stack

Untuk development lengkap dengan OSRM + Nominatim:

```bash
# 1. Start semua services
docker-compose -f docker-compose-osrm.yml up osrm-backend &
docker-compose -f docker-compose.nominatim.yml up -d &
docker-compose -f docker-compose-osrm.yml up osrm-frontend

# 2. Access points
# - OSRM Routing: http://localhost:5000
# - Custom Frontend: http://localhost:9966  
# - Nominatim API: http://localhost:8080
```
