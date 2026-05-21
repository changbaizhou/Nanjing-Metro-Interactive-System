// 全局变量存储地铁站点数据（由外部逻辑加载后赋值）
let metroStations = [];  // 你应在图层加载时填充这个数组

// 定位功能
function locateMe() {
     // 先清理旧提示框（防止卡住）
    const oldBox = document.querySelector('.station-confirm-box');
    if (oldBox) oldBox.remove();
    
    if (!navigator.geolocation) {
        alert("您的浏览器不支持地理定位功能");
        return;
    }

    const button = document.querySelector('.left-button[onclick="locateMe()"]');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 定位中...';

    navigator.geolocation.getCurrentPosition(
        function(position) {
            button.innerHTML = originalText;

            const [gcjLng, gcjLat] = window.wgs84ToGcj02(position.coords.longitude, position.coords.latitude);
             const userLocation = {
               lat: gcjLat,
                lng: gcjLng
              };
            clearOldMarkers();
            createUserMarker(userLocation);

            // window.userLocationMarker.bindPopup(`
            //     <div class="location-popup">
            //         <h4>您的位置</h4>
            //     </div>
            // `).openPopup();

            const nearestStation = findNearestStation(userLocation);
if (nearestStation) {
    setTimeout(() => {
        showNearestStationInfo(userLocation, nearestStation);
    }, 0);
} else {
    window.userLocationMarker.bindPopup(`
        <div class="location-popup">
            <h4>您的位置</h4>
            <p>附近未找到地铁站</p>
        </div>
    `).openPopup();
    map.setView([userLocation.lat, userLocation.lng], 15);
}
        },
        function(error) {
            button.innerHTML = originalText;
            alert("定位失败: " + ({
                PERMISSION_DENIED: "您拒绝了定位请求",
                POSITION_UNAVAILABLE: "位置信息不可用",
                TIMEOUT: "获取位置请求超时",
                UNKNOWN_ERROR: "发生未知错误"
            }[error.code] || "未知错误"));
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// 清除旧标记
function clearOldMarkers() {
    if (window.userLocationMarker) {
        map.removeLayer(window.userLocationMarker);
    }
    if (window.nearestStationMarker) {
        map.removeLayer(window.nearestStationMarker);
    }
}

// 创建用户位置标记
function createUserMarker(location) {
    window.userLocationMarker = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div class="pulse-dot"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        }),
        zIndexOffset: 1000
    }).addTo(map);
}

// 查找最近的地铁站
function findNearestStation(userLoc) {
    if (metroStations.length === 0) return null;

    let nearestStation = null;
    let minDistance = Infinity;

    metroStations.forEach(station => {
        const [lng, lat] = station.coordinates;
        const distance = calculateDistance(userLoc.lat, userLoc.lng, lat, lng);

        if (distance < minDistance) {
            minDistance = distance;
            nearestStation = {
                name: station.name,
                line: station.line || '未知线路',
                lat,
                lng,
                distance
            };
        }
    });

    return nearestStation;
}

// 显示最近地铁站信息
function showNearestStationInfo(userLoc, station) {
  map.options.closePopupOnClick = true;

  window.userLocationMarker.bindPopup(`
      <div class="location-popup">
          <h4>您的位置</h4>
          <p>纬度: ${userLoc.lat.toFixed(6)}</p>
          <p>经度: ${userLoc.lng.toFixed(6)}</p>
      </div>
  `, { autoClose: false });

  window.nearestStationMarker = L.marker([station.lat, station.lng], {
    icon: L.divIcon({
      className: 'nearest-station-marker',
      html: '<div class="station-highlight"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    }),
    zIndexOffset: 1001
  }).addTo(map).bindPopup(`
      <div class="station-popup">
          <h4>最近地铁站</h4>
          <p><strong>${station.name}</strong></p>
          <p>距离您: ${station.distance.toFixed(0)}米</p>
          <p>线路: ${station.line}</p>
      </div>
  `, { autoClose: false });

  window.userLocationMarker.openPopup();
  window.nearestStationMarker.openPopup();

  const centerLat = (userLoc.lat + station.lat) / 2;
  const centerLng = (userLoc.lng + station.lng) / 2;
  map.setView([centerLat, centerLng], 15);

  const currentPage = window.location.pathname.split('/').pop();

  if (currentPage === 'webgis1.html') {
    const confirmBox = document.createElement('div');
    confirmBox.className = 'station-confirm-box';
    confirmBox.innerHTML = `
      <div class="confirm-content">
        <p>是否将最近地铁站 <strong>${station.name}</strong> 设置为起点？</p>
        <button id="confirmYes">是</button>
        <button id="confirmNo">否</button>
      </div>
    `;
    document.body.appendChild(confirmBox);

    // ⚠️ 注意：必须在 append 后才能获取按钮元素
    document.getElementById('confirmYes').onclick = () => {
      const startInput = document.getElementById('startInput');
      if (startInput) startInput.value = station.name;
      document.body.removeChild(confirmBox);
    };

    document.getElementById('confirmNo').onclick = () => {
      document.body.removeChild(confirmBox);
    };
  }
}


// 计算两个坐标点之间的距离（米）
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
