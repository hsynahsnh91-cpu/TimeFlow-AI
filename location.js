(function() {
  let watchId = null;
  let map = null, marker = null;
  const history = [];

  const initMap = () => {
    if (map) map.invalidateSize();
    else {
      map = L.map('map-container').setView([24.7136, 46.6753], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
    }
  };

  const reverseGeo = async (lat, lon) => {
    if (!navigator.onLine) return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const d = await res.json();
      return d.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch { return `${lat.toFixed(4)}, ${lon.toFixed(4)}`; }
  };

  const update = (pos) => {
    const coords = `${pos.latitude}, ${pos.longitude}`;
    document.getElementById('loc-coords').textContent = coords;
    document.getElementById('loc-timestamp').textContent = new Date(pos.timestamp).toLocaleString();
    
    if (map) {
      const point = L.latLng(pos.latitude, pos.longitude);
      if (!marker) marker = L.marker(point).addTo(map);
      else marker.setLatLng(point);
      map.setView(point, 14);
    }

    history.unshift({ lat: pos.latitude, lon: pos.longitude, ts: pos.timestamp });
    if (history.length > 100) history.pop();
    renderHistory();

    if (document.hidden) return; // Don't hammer DB if hidden
    TimeFlowDB.add('locations', { id: crypto.randomUUID(), lat: pos.latitude, lon: pos.longitude, timestamp: pos.timestamp, taskId: document.getElementById('loc-task-select').value || null });
    reverseGeo(pos.latitude, pos.longitude).then(addr => document.getElementById('loc-address').textContent = addr);
  };

  const startTracking = () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    if (!navigator.geolocation) return TimeFlowNotify.toast('GPS غير مدعوم', 'error');
    watchId = navigator.geolocation.watchPosition(update, (e) => TimeFlowNotify.toast(e.message, 'error'), { enableHighAccuracy: true, maximumAge: 10000 });
    document.getElementById('loc-start-track').textContent = '🛑 إيقاف التتبع';
  };

  const stopTracking = () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    document.getElementById('loc-start-track').textContent = '▶️ بدء التتبع المباشر';
  };

  const renderHistory = () => {
    const ul = document.getElementById('location-history');
    ul.innerHTML = history.slice(0,20).map(h => `<li><span>${new Date(h.ts).toLocaleTimeString()}</span><span>${h.lat.toFixed(4)}, ${h.lon.toFixed(4)}</span></li>`).join('');
  };

  window.TimeFlowLocation = { initMap, startTracking, stopTracking, renderHistory };
})();