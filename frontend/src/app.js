// OSRM Frontend Application
class OSRMApp {
    constructor() {
        this.map = null;
        this.routeLayer = null;
        this.startMarker = null;
        this.endMarker = null;
        this.osrmBackend = process.env.OSRM_BACKEND || 'http://localhost:5000';
        
        this.initMap();
        this.bindEvents();
    }

    initMap() {
        // Initialize map centered on Jakarta, Indonesia
        this.map = L.map('map').setView([-6.2088, 106.8456], 11);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add click event to map
        this.map.on('click', (e) => this.onMapClick(e));
        
        console.log('🗺️ Map initialized successfully');
        console.log('🔗 OSRM Backend:', this.osrmBackend);
    }

    bindEvents() {
        // Add event listeners for input changes
        document.getElementById('start').addEventListener('change', () => this.updateMarkers());
        document.getElementById('end').addEventListener('change', () => this.updateMarkers());
        
        // Initialize markers
        this.updateMarkers();
    }

    onMapClick(e) {
        const startInput = document.getElementById('start');
        const endInput = document.getElementById('end');
        
        if (!startInput.value || startInput.value === '-6.2088, 106.8456') {
            startInput.value = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
        } else if (!endInput.value || endInput.value === '-6.1751, 106.8650') {
            endInput.value = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
        }
        
        this.updateMarkers();
    }

    updateMarkers() {
        const startCoords = this.parseCoordinates(document.getElementById('start').value);
        const endCoords = this.parseCoordinates(document.getElementById('end').value);

        // Remove existing markers
        if (this.startMarker) {
            this.map.removeLayer(this.startMarker);
        }
        if (this.endMarker) {
            this.map.removeLayer(this.endMarker);
        }

        // Add start marker
        if (startCoords) {
            this.startMarker = L.marker(startCoords, {
                icon: this.createIcon('🟢', 'green')
            }).addTo(this.map).bindPopup('Start Location');
        }

        // Add end marker
        if (endCoords) {
            this.endMarker = L.marker(endCoords, {
                icon: this.createIcon('🔴', 'red')
            }).addTo(this.map).bindPopup('End Location');
        }
    }

    createIcon(emoji, color) {
        return L.divIcon({
            html: `<div style="background: ${color}; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 16px;">${emoji}</div>`,
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }

    parseCoordinates(coordString) {
        if (!coordString) return null;
        
        const coords = coordString.split(',').map(c => parseFloat(c.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            return [coords[0], coords[1]];
        }
        return null;
    }

    async calculateRoute() {
        const startCoords = this.parseCoordinates(document.getElementById('start').value);
        const endCoords = this.parseCoordinates(document.getElementById('end').value);

        if (!startCoords || !endCoords) {
            this.showError('Please provide valid start and end coordinates');
            return;
        }

        this.showLoading(true);
        this.clearError();

        try {
            const url = `${this.osrmBackend}/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&steps=true`;
            
            console.log('🚗 Requesting route from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.code !== 'Ok') {
                throw new Error(`OSRM Error: ${data.message || 'Unknown error'}`);
            }

            this.displayRoute(data);
            console.log('✅ Route calculated successfully');
            
        } catch (error) {
            console.error('❌ Route calculation failed:', error);
            this.showError(`Failed to calculate route: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    displayRoute(data) {
        // Remove existing route
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
        }

        const route = data.routes[0];
        const geometry = route.geometry;

        // Add route to map
        this.routeLayer = L.geoJSON(geometry, {
            style: {
                color: '#3388ff',
                weight: 6,
                opacity: 0.8
            }
        }).addTo(this.map);

        // Fit map to route bounds
        this.map.fitBounds(this.routeLayer.getBounds(), { padding: [20, 20] });

        // Display route information
        this.displayRouteInfo(route);
    }

    displayRouteInfo(route) {
        const distance = (route.distance / 1000).toFixed(2);
        const duration = Math.round(route.duration / 60);
        
        const routeInfoHtml = `
            <div class="route-info">
                <h3>📊 Route Information</h3>
                <p><strong>📏 Distance:</strong> ${distance} km</p>
                <p><strong>⏱️ Duration:</strong> ${duration} minutes</p>
                <p><strong>🛣️ Steps:</strong> ${route.legs[0].steps.length} turns</p>
            </div>
        `;
        
        document.getElementById('route-info').innerHTML = routeInfoHtml;
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    showError(message) {
        document.getElementById('error').innerHTML = `
            <div class="error">
                ❌ ${message}
            </div>
        `;
    }

    clearError() {
        document.getElementById('error').innerHTML = '';
    }
}

// Global function for button onclick
window.calculateRoute = function() {
    window.osrmApp.calculateRoute();
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.osrmApp = new OSRMApp();
    console.log('🚀 OSRM Frontend App initialized');
});
