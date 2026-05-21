const geojsonFiles = [
    { path: 'map_geojson/S9_point.json', icon: 'images/地铁S9.png', label: 'S9 点' },
    { path: 'map_geojson/S8_point.json', icon: 'images/地铁S8.png', label: 'S8 点' },
    { path: 'map_geojson/S7_point.json', icon: 'images/地铁S7.png', label: 'S7 点' },
    { path: 'map_geojson/S6_point.json', icon: 'images/地铁S6.png', label: 'S6 点' },
    { path: 'map_geojson/S3_point.json', icon: 'images/地铁S3.png', label: 'S3 点' },
    { path: 'map_geojson/S1_point.json', icon: 'images/地铁S1.png', label: 'S1 点' },
    { path: 'map_geojson/10_point.json', icon: 'images/地铁10.png', label: '10 点' },
    { path: 'map_geojson/7_point.json', icon: 'images/地铁7.png', label: '7 点' },
    { path: 'map_geojson/5_point.json', icon: 'images/地铁5.png', label: '5 点' },
    { path: 'map_geojson/4_point.json', icon: 'images/地铁4.png', label: '4 点' },
    { path: 'map_geojson/3_point.json', icon: 'images/地铁3.png', label: '3 点' },
    { path: 'map_geojson/2_point.json', icon: 'images/地铁2.png', label: '2 点' },
    { path: 'map_geojson/1_point.json', icon: 'images/地铁1.png', label: '1 点' },
    { path: 'map_geojson/S9_line.json', label: 'S9 线', isLine: true, color: '#d39c2e' },
    { path: 'map_geojson/S8_line.json', label: 'S8 线', isLine: true, color: '#ea7600' },
    { path: 'map_geojson/S7_line.json', label: 'S7 线', isLine: true, color: '#e89cae' },
    { path: 'map_geojson/nanjing_polygon.geojson', isPolygon: true, color: '#999999', label: '南京范围' },
    { path: 'map_geojson/S6_line.json', label: 'S6 线', isLine: true, color: '#e89abe' },
    { path: 'map_geojson/S3_line.json', label: 'S3 线', isLine: true, color: '#8d5779' },
    { path: 'map_geojson/S1_line.json', label: 'S1 线', isLine: true, color: '#00b2a9' },
    { path: 'map_geojson/10_line.json', label: '10 线', isLine: true, color: '#b9975b' },
    { path: 'map_geojson/7_line.json', label: '7 线', isLine: true, color: '#40de5a' },
    { path: 'map_geojson/5_line.json', label: '5 线', isLine: true, color: '#fdda25' },
    { path: 'map_geojson/4_line.json', label: '4 线', isLine: true, color: '#7d55c7' },
    { path: 'map_geojson/3_line.json', label: '3 线', isLine: true, color: '#009a44' },
    { path: 'map_geojson/2_line.json', label: '2 线', isLine: true, color: '#a6093d' },
    { path: 'map_geojson/1_line.json', label: '1 线', isLine: true, color: '#009ace' },

];

const nameMapping = {
  "乘客守则": "乘客守则",
  "1号线": "1 线",
  "2号线": "2 线",
  "3号线": "3 线",
  "4号线": "4 线",
  "5号线": "5 线",
  "7号线": "7 线",
  "10号线": "10 线",
  "S1号线": "S1 线",
  "S3号线": "S3 线",
  "S6号线": "S6 线",
  "S7号线": "S7 线",
  "S8号线": "S8 线",
  "S9号线": "S9 线"
};
const metroGraph = {
    stations: {},
    connections: {},
    lines: {}
};
const lineCache = {};
window.overlayLayers = {};
let map;
let hasAddedLocateControl = false;
//地图中的定位控件
L.Control.LocateControl = L.Control.extend({
  onAdd: function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

    const button = L.DomUtil.create('a', '', container);
    button.href = '#';
    button.title = '点击进行定位';
     button.innerHTML = `<img src="images/定位位置目的地.png" alt="定位" style="width:24px;height:24px;">`;

    L.DomEvent.on(button, 'click', L.DomEvent.stopPropagation)
              .on(button, 'click', L.DomEvent.preventDefault)
              .on(button, 'click', () => {
                // 🔁 调用你自己的定位函数
                locateMe(map);
              });

    return container;
  },
});

function initMap() {
  if (map) return Promise.resolve(map); // 已初始化直接返回 Promise
  map = L.map('map', {
    center: [32.0000, 118.7800],
    zoom: 12,
    zoomControl: false,
    attributionControl: false
  });
      if (!hasAddedLocateControl) {
    new L.Control.LocateControl({ position: 'bottomleft' }).addTo(map);
    hasAddedLocateControl = true;
  }

  L.control.zoom({
  position: 'bottomleft' // 设置缩放控件的位置为左下角
}).addTo(map);

//底图切换逻辑底图切换逻辑底图切换逻辑底图切换逻辑底图切换逻辑底图切换逻辑底图切换逻辑
const appConfig = window.JL_METRO_CONFIG || {};
const amapKey = appConfig.AMAP_KEY || "";
const amapKeyParam = amapKey ? `&key=${encodeURIComponent(amapKey)}` : "";

const baseLayerUrls = {
  "标准地图": {
    url: `https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}${amapKeyParam}`,
    options: {
      subdomains: ["1", "2", "3", "4"], // 使用1-4而不是0-3，更符合高德官方推荐
      maxZoom: 19, // 高德地图支持到19级
      minZoom: 3,
      keepBuffer: 2, // 增加缓冲区减少边缘加载问题
      updateWhenIdle: true,
      detectRetina: true, // 支持视网膜屏幕
      crossOrigin: 'anonymous', // 避免CORS问题
      attribution: "© 高德地图",
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' // 透明占位图
    }
  },
  "卫星影像": {
    url: `https://webst0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}${amapKeyParam}`,
    options: {
      subdomains: ["1", "2", "3", "4"],
      maxZoom: 19,
      minZoom: 3,
      keepBuffer: 2,
      updateWhenIdle: true,
      detectRetina: true,
      crossOrigin: 'anonymous',
      attribution: "© 高德地图",
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    }
  },
  "灰色地图": {
    url: `https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}${amapKeyParam}`,
    options: {
      subdomains: ["1", "2", "3", "4"],
      maxZoom: 19,
      minZoom: 3,
      keepBuffer: 2,
      updateWhenIdle: true,
      detectRetina: true,
      crossOrigin: 'anonymous',
      attribution: "© 高德地图",
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    }
  }
};

let currentBaseLayer = null;

function switchBaseLayer(name) {
  if (!baseLayerUrls[name]) {
    console.warn("不存在的底图名称：" + name);
    return;
  }
  
  const newLayer = L.tileLayer(
    baseLayerUrls[name].url, 
    baseLayerUrls[name].options
  );
  
  // 改进的错误处理机制
  newLayer.on('tileerror', function(e) {
    const tile = e.tile;
    const src = tile.src;
    
    // 最多重试3次
    const retryCount = (src.match(/retry=(\d+)/g) || []).length;
    if (retryCount < 3) {
      tile.src = src.replace(/(\?|&)retry=\d+/, '') + 
                (src.includes('?') ? '&' : '?') + 
                'retry=' + Date.now();
    } else {
      tile.src = baseLayerUrls[name].options.errorTileUrl;
    }
  });
  
  // 平滑切换图层
  if (currentBaseLayer) {
    map.addLayer(newLayer);
    map.once('baselayerchange', function() {
      map.removeLayer(currentBaseLayer);
    });
  } else {
    map.addLayer(newLayer);
  }
  
  currentBaseLayer = newLayer;
}

// 默认加载标准地图
switchBaseLayer("标准地图");
// 添加切换控件
const baseLayerControl = L.control({ position: 'topright' });

baseLayerControl.onAdd = function () {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
  const select = document.createElement('select');
  
  for (const name in baseLayerUrls) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  }
  select.value = "标准地图";

  select.onchange = () => {
    switchBaseLayer(select.value);
  };

  div.appendChild(select);

  L.DomEvent.disableClickPropagation(div);
  return div;
};

baseLayerControl.addTo(map);
//底图切换逻辑底图切换逻辑底图切换逻辑底图切换逻辑底图切换逻辑底图切换逻辑底图切换逻辑

//转换为高德坐标系逻辑
window.wgs84ToGcj02= function(lng, lat) {
  const PI = Math.PI;
  const a = 6378245.0;
  const ee = 0.00669342162296594323;

  function transformLat(x, y) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y +
      0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }

  function transformLon(x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x +
      0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
  }

  function outOfChina(lng, lat) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }

  if (outOfChina(lng, lat)) return [lng, lat];

  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLon = transformLon(lng - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
  const mgLat = lat + dLat;
  const mgLon = lng + dLon;
  return [mgLon, mgLat];
}





//加载geojson逻辑


  const loadTasks = geojsonFiles.map(fileInfo =>
  fetch(fileInfo.path)
    .then(res => res.json())
    .then(data => {
      let layer;
      if (fileInfo.isLine) {
          data.features.forEach(f => {
              if (f.geometry?.type === "LineString") {
               f.geometry.coordinates = f.geometry.coordinates.map(([lng, lat]) =>
                 wgs84ToGcj02(lng, lat)
              );
              }
            });
        layer = L.geoJSON(data, {
          style: {
            color: fileInfo.color || '#000',
            weight: 4,
            opacity: 0.8
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties?.['线路名称'] || fileInfo.label;
            layer.on('click', () => {
              layer.bindPopup("点击了线路: " + name).openPopup();
            });
          }
        }).addTo(map);
      } else if (fileInfo.isPolygon) {
        if (fileInfo.isPolygon) {
  data.features.forEach(f => {
    if (f.geometry?.type === "Polygon") {
      f.geometry.coordinates = f.geometry.coordinates.map(ring =>
        ring.map(([lng, lat]) => wgs84ToGcj02(lng, lat))
      );
    }
  });
}

        layer = L.geoJSON(data, {
          style: {
            color: fileInfo.color || '#666',
            weight: 2,
            fillColor: fileInfo.color || '#ccc',
            fillOpacity: 0.3
          }
        }).addTo(map);
        layer.bringToBack();
      } else {
        layer = L.geoJSON(data, {
          onEachFeature: (feature, layer) => {
            const props = feature.properties || {};
            const name = props['站点名称'] || "未命名";
            const transfer = props['换乘信息'] || "无";
            const queryName = props['查询专用站点名称'] || name;
            const lineName = props['线路名称'] || "";
            const exits = props['出口数量'] || "无";
            const park = props['公园景点'] || "无";
            const medical = props['医疗卫生'] || "无";

            if (!metroGraph.stations[name]) {
              metroGraph.stations[name] = {
                queryName,
                lines: [],
                coords: layer.getLatLng(),
                originalName: name,
                isTransfer: transfer !== "无"
              };
            }

            if (lineName && !metroGraph.stations[name].lines.includes(lineName)) {
              metroGraph.stations[name].lines.push(lineName);
            }

            if (transfer !== "无") {
              metroGraph.stations[name].isTransfer = true;
            }

            if (queryName !== name) {
              metroGraph.nameMapping = metroGraph.nameMapping || {};
              metroGraph.nameMapping[queryName] = name;
            }

            const popupContent = `
              <b>站点名称：</b>${name}<br/>
              <b>换乘信息：</b>${transfer}<br/>
              <b>出口数量：</b>${exits}<br/>
              <b>公园景点：</b>${park}<br/>
              <b>医疗卫生：</b>${medical}
            `;

            layer.bindPopup(popupContent);
          },
          pointToLayer: (feature, latlng) => {
            const [lng, lat] = wgs84ToGcj02(latlng.lng, latlng.lat);
            latlng = L.latLng(lat, lng);
            const name = feature.properties?.['站点名称'] || "";
            if (!name) return null;

            const zoom = map.getZoom();
            const scale = getIconScaleByZoom(zoom);
            const size = 20 * scale;
            const fontSize = 8 * scale;

            const html = `
              <div style="position: relative; display: inline-block; text-align: center;">
                <img src="${fileInfo.icon}" style="width: ${size}px; height: ${size}px;">
                <div class="station-label" style="
                  position: absolute;
                  bottom: 0px;
                  left: 100%;
                  white-space: nowrap;
                  font-size: ${fontSize}px;
                  color: black;
                  background-color: rgba(255,255,255,0.7);
                  padding: 2px 4px;
                  border-radius: 3px;
                  transform: translateX(5px);
                  font-weight: bold;">
                  ${name}
                </div>
              </div>
            `;

            const divIcon = L.divIcon({
              className: '',
              html: html,
              iconSize: [size, size],
              iconAnchor: [size / 2, size]
            });

            const marker = L.marker(latlng, { icon: divIcon });
            marker._iconUrl = fileInfo.icon;
            marker._stationName = name;
            return marker;
          }
        }).addTo(map);
      }
      overlayLayers[fileInfo.label] = layer;

      // 关键：返回 layer 保证 Promise 链等待此任务完成
     
      return layer;
    })
);


  return Promise.all(loadTasks).then(() => {
    map.on('zoom', () => {
      const zoomLevel = map.getZoom();
      const scale = getIconScaleByZoom(zoomLevel);
      updateMarkerIconSize(scale);
      updateLineWidth(scale);
    });

    initMetroGraph(); // 确保此时站点数据已经准备完毕

    console.log("地图与地铁图加载完毕");
    return map; // 返回 map 以支持链式调用
  });
}

function getIconScaleByZoom(zoomLevel) {
    return Math.pow(1.2, zoomLevel - 12);
}

function updateMarkerIconSize(scale) {
    Object.values(overlayLayers).forEach(layer => {
        if (layer instanceof L.GeoJSON) {
            layer.eachLayer(marker => {
                if (marker._iconUrl && marker._stationName) {
                    const iconUrl = marker._iconUrl;
                    const name = marker._stationName;
                    const size = 20 * scale;
                    const fontSize = 8 * scale;

                    const html = `
                        <div style="position: relative; display: inline-block; text-align: center;">
                            <img src="${iconUrl}" style="width: ${size}px; height: ${size}px;">
                            <div class="station-label" style="position: absolute; bottom: -4px; left: 100%; white-space: nowrap; font-size: ${fontSize}px; color: black; background-color: rgba(255,255,255,0.7); padding: 2px 4px; border-radius: 3px; transform: translateX(5px); font-weight: bold;">
                                ${name}
                            </div>
                        </div>
                    `;

                    const updatedIcon = L.divIcon({
                        className: '',
                        html: html,
                        iconSize: [size, size],
                        iconAnchor: [size / 2, size]
                    });

                    marker.setIcon(updatedIcon);
                }
            });
        }
    });
}

function updateLineWidth(scale) {
    Object.entries(overlayLayers).forEach(([label, layer]) => {
        if (label.includes('线') && layer.setStyle) {
            layer.setStyle({
                weight: 4 * scale
            });
        }
    });
}

function getMetroGraph() {
  return metroGraph;
}
function initMetroGraph() {
    // 清空现有数据

    metroGraph.connections = {};
    metroGraph.lines = {};
     metroGraph.nameMapping = {}; 
// 替换原有的 buildConnections 函数
function buildConnections() {
    if (Object.keys(metroGraph.stations).length === 0) {
    console.warn("⚠️ buildConnections 调用时站点数据为空！");
    return;
  }
  metroGraph.connections = {};

  // 遍历每条线图层
  Object.entries(overlayLayers).forEach(([label, layer]) => {
    if (!label.includes('线') || !(layer instanceof L.GeoJSON)) return;

    layer.eachLayer(lineLayer => {
      const feature = lineLayer.feature;
      const props = feature.properties || {};

      const fromRaw = props['端点1'];
      const toRaw = props['端点2'];

      const fromName = resolveStationByQueryName(fromRaw);
      const toName = resolveStationByQueryName(toRaw);

      if (!fromName || !toName) {
        console.warn(`跳过连接：${fromRaw} - ${toRaw}（未找到匹配站点）`);
        return;
      }

      const from = metroGraph.stations[fromName];
      const to = metroGraph.stations[toName];
      const distance = from.coords.distanceTo(to.coords);

      addConnection(fromName, toName, distance);
    });
  });

  // 构建换乘连接（距离 < 150m 的换乘站）
  Object.entries(metroGraph.stations).forEach(([name, station]) => {
    if (!station.isTransfer) return;

    Object.entries(metroGraph.stations).forEach(([otherName, otherStation]) => {
      if (name !== otherName && otherStation.isTransfer) {
        const dist = station.coords.distanceTo(otherStation.coords);
        if (dist < 150) {
          addConnection(name, otherName, dist);
        }
      }
    });
  });

  console.log("地铁连接图构建完成", metroGraph.connections);
}

function resolveStationByQueryName(queryName) {
  if (!queryName) return null;
  const originalName = metroGraph.nameMapping?.[queryName] || queryName;
  if (!metroGraph.stations[originalName]) {
    console.warn(`⚠️ 无法解析站点：${queryName}（映射为 ${originalName}）`);
    return null;
  }
  return originalName;
}
// 辅助函数：添加双向连接
function addConnection(from, to, distance) {
  if (!metroGraph.connections[from]) metroGraph.connections[from] = {};
  if (!metroGraph.connections[to]) metroGraph.connections[to] = {};
  
  metroGraph.connections[from][to] = distance;
  metroGraph.connections[to][from] = distance;
}

// 辅助函数：计算点到线段的最近距离
function findMinDistanceToLine(point, lineCoords) {
  let minDist = Infinity;
  lineCoords.forEach(coord => {
    const linePoint = L.latLng(coord[1], coord[0]);
    const dist = point.distanceTo(linePoint);
    if (dist < minDist) minDist = dist;
  });
  return minDist;
}

    // 在initMetroGraph函数末尾添加
window.metroDebug = {
    // 查看任意站点的连接关系
  getStationConnections: (name) => {
    const graph = getMetroGraph();
    return {
      station: graph.stations[name],
      connections: graph.connections[name] || '无连接'
    };
  },

  // 查找线路所有站点
  getLineStations: (lineName) => {
    const graph = getMetroGraph();
    return Object.entries(graph.stations)
      .filter(([_, s]) => s.lines.includes(lineName))
      .map(([name]) => name);
  },

  // 可视化连接关系（控制台打印）
  printConnectionMap: () => {
    const graph = getMetroGraph();
    console.groupCollapsed('全网连接关系');
    Object.entries(graph.connections).forEach(([from, links]) => {
      console.group(`%c${from}`, 'color: #2196F3');
      Object.entries(links).forEach(([to, dist]) => {
        console.log(`→ ${to} (${dist}m)`);
      });
      console.groupEnd();
    });
    console.groupEnd();
  },

  // 检查孤立站点
  findIsolatedStations: () => {
    const graph = getMetroGraph();
    return Object.keys(graph.stations)
      .filter(name => !graph.connections[name])
      .map(name => ({
        name,
        ...graph.stations[name]
      }));
  }
};
      // 这里可以添加从GeoJSON构建网络图的逻辑
    buildConnections();
    console.log("地铁网络图已初始化");
     metroStations = Object.entries(metroGraph.stations).map(([name, station]) => ({
    name: name,
    coordinates: [station.coords.lng, station.coords.lat],
    line: station.lines?.join(', ') || '未知线路'
  }));
}
window.getMetroGraph = getMetroGraph;
window.initMetroGraph = initMetroGraph;
window.addEventListener("load", () => {
  initMap().then(() => {
    console.log("地图和地铁图数据已初始化");

    // ✅ 在这里添加比例尺控件
    L.control.scale({
      position: 'bottomright',
      metric: true,
      imperial: false
    }).addTo(map);
     // 确保站点数据已经准备好，初始化模糊搜索
    initSearch();
  }).catch(err => {
    console.error("地图初始化出错:", err);
  });
 // 点击地图空白处关闭定位点和最近站点标记
    map.on('click', () => {
        if (window.userLocationMarker) {
            map.removeLayer(window.userLocationMarker);
            window.userLocationMarker = null;
        }
        if (window.nearestStationMarker) {
            map.removeLayer(window.nearestStationMarker);
            window.nearestStationMarker = null;
        }
    });
  
});

