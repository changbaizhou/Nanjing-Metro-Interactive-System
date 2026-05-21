let currentLayer = null; // 当前加载的图层
const customMarkers = [];
let lastQueriedPOIs = []; 
const poiMarkers = []; // 用于存储所有查询点的 marker

function getIconUrlByName(name) {
    // 按照指定顺序返回相应的图标URL
    switch (name) {
        case '派出所':
            return 'subwayimage/1.png';
        case '停车场':
            return 'subwayimage/2.png';
        case '快递站':
            return 'subwayimage/3.png';
        case '洗衣店':
            return 'subwayimage/4.png';
        case '酒店':
            return 'subwayimage/5.png';
        case '民宿':
            return 'subwayimage/6.png';
        case '酒吧':
            return 'subwayimage/7.png';
        case '网咖':
            return 'subwayimage/8.png';
        case '电影院':
            return 'subwayimage/9.png';
        case '火锅店':
            return 'subwayimage/10.png';
        case '自助餐':
            return 'subwayimage/11.png';
        case '烧烤店':
            return 'subwayimage/12.png';
        case '奶茶店':
            return 'subwayimage/13.png';
        case '咖啡馆':
            return 'subwayimage/14.png';
        case '博物馆':
            return 'subwayimage/15.png';
        case '艺术馆':
            return 'subwayimage/16.png';
        case '寺庙':
            return 'subwayimage/17.png';
        case '学校':
            return 'subwayimage/18.png';
        case '图书馆':
            return 'subwayimage/19.png';
        case '培训机构':
            return 'subwayimage/20.png';
        case '医院':
            return 'subwayimage/21.png';
        case '诊所':
            return 'subwayimage/22.png';
        case '药店':
            return 'subwayimage/23.png';
        case '宠物医院':
            return 'subwayimage/24.png';
        case '体育馆':
            return 'subwayimage/25.png';
        case '游泳馆':
            return 'subwayimage/26.png';
        case '高尔夫球场':
            return 'subwayimage/27.png';
        case '公园':
            return 'subwayimage/28.png';
        case '健身房':
            return 'subwayimage/29.png';
        case '农贸市场':
            return 'subwayimage/30.png';
        case '商场':
            return 'subwayimage/31.png';
        case '超市':
            return 'subwayimage/32.png';
        case '银行':
            return 'subwayimage/33.png';
             case '卫生间':
            return 'subwayimage/34.png';
        default:
            return 'subwayimage/1.png'; // 默认图标
    }
}

// 定义一个图层对象，记录每种类型对应的图层
const layers = {};

function loadPOIData(e) {
    const btn = e.currentTarget;
    const name = btn.getAttribute('data-name');
    const geojsonPath = `subwaylive/${name}.geojson`;
    const iconUrl = getIconUrlByName(name);

    // 检查是否已加载该图层
    if (layers[name]) {
        map.removeLayer(layers[name]);
        layers[name] = null;
        btn.textContent = name;
        return;
    }

    btn.textContent = '加载中...';
    btn.disabled = true;

    // 添加时间戳防止缓存
    const timestamp = new Date().getTime();
    const url = `${geojsonPath}?t=${timestamp}`;

    fetch(url)
    .then(response => {
        // 先检查响应状态是否 OK
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP ${response.status}: ${text.slice(0, 100)}...`);
            });
        }

        // 尝试直接解析 JSON（无论 content-type 是否为 application/json）
        return response.json().catch(() => {
            return response.text().then(text => {
                console.warn('返回内容不是有效的 JSON:', text.slice(0, 200));
                throw new Error('返回内容无法解析为 JSON');
            });
        });
    })

        .then(data => {
            // 验证GeoJSON数据
            if (!data || !data.type) {
                throw new Error('无效的GeoJSON数据');
            }

            console.log(`加载的${name}数据：`, data);

            // 创建图层并添加到地图
            layers[name] = L.geoJSON(data, {
                pointToLayer: (feature, latlng) => {
                    const fname = feature.properties?.name || `未命名${name}`;
                    const size = 32;
                     const [gcjLng, gcjLat] = wgs84ToGcj02(latlng.lng, latlng.lat);
                    const html = `
<div style="position:relative; width:${size}px; height:${size}px; line-height:0;">
    <img src="${iconUrl}" style="width:100%; height:100%; object-fit:contain; border:none;">
    <div style="
        position:absolute;
        bottom:-15px;
        left:50%;
        transform:translateX(-50%);
        white-space:nowrap;
        font-size:12px;           
        color: black;
        padding:6px 8px;
        border-radius:3px;
        z-index:1000 !important;
        pointer-events:none;">
        ${fname}
    </div>
</div>`;
                    
                    const marker = L.marker([gcjLat, gcjLng], {
                        icon: L.divIcon({
                            html: html,
                            className: 'custom-marker',
                            iconSize: [size, size + 15],
                            iconAnchor: [size/2, size + 7]
                        })
                    });
                    
                    marker.bindPopup(`<b>${fname}</b><br><span>具体地址为：${feature.properties?.address || '地址未提供'}</span>`);
                    return marker;
                }
            }).addTo(map);
            
            btn.textContent = `隐藏${name}`;
        })
        .catch(error => {
            console.error(`加载${name}数据失败:`, error);
            btn.textContent = name;
            
            // 显示更友好的错误提示
            const errorMsg = error.message.includes('404') ? 
                `找不到${name}数据文件` : 
                `加载${name}数据失败`;
            
            alert(`${errorMsg}，请检查控制台获取详细信息`);
        })
        .finally(() => {
            btn.disabled = false;
        });
}
// 返回上一页函数
function goBack() {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.subcategory-item').forEach(btn => {
        btn.addEventListener('click', loadPOIData); // 为每个按钮绑定事件
    });
});






// 地铁线路与站点联动功能
function initMetroSelection() {
    const lineSelect = document.getElementById('lineSelect');
    const stationSelect = document.getElementById('stationSelect');
    // 新增：站点选择事件
    stationSelect.addEventListener('change', function() {
        if (this.value) {
            flyToStation(this.value);
        }
    });
    // 线路到JSON文件的映射
    const lineToJsonMap = {
        '1': 'map_geojson/1_point.json',
        '2': 'map_geojson/2_point.json',
        '3': 'map_geojson/3_point.json',
        '4': 'map_geojson/4_point.json',
        '7': 'map_geojson/7_point.json',
        '10': 'map_geojson/10_point.json',
        'S1': 'map_geojson/S1_point.json',
        'S3': 'map_geojson/S3_point.json',
        'S6': 'map_geojson/S6_point.json',
        'S7': 'map_geojson/S7_point.json',
        'S8': 'map_geojson/S8_point.json',
        'S9': 'map_geojson/S9_point.json'
    };

    // 加载站点数据的函数
async function loadStations(line) {
    stationSelect.innerHTML = '<option value="">加载中...</option>';
    stationSelect.disabled = true;

    if (!line) {
        stationSelect.innerHTML = '<option value="">请先选择线路</option>';
        stationSelect.disabled = true;
        return;
    }

    const jsonFile = lineToJsonMap[line];
    if (!jsonFile) {
        stationSelect.innerHTML = '<option value="">该线路数据不可用</option>';
        return;
    }

    try {
        const response = await fetch(jsonFile);
        if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`);
        
        const data = await response.json();
        console.log('收到的站点数据:', data);
        
        // 清空现有选项
        stationSelect.innerHTML = '<option value="">请选择站点</option>';
        
        // 处理不同格式的数据
        let stations = [];
        if (Array.isArray(data)) {
            stations = data;
        } else if (data.features && Array.isArray(data.features)) {
            stations = data.features;
        } else if (typeof data === 'object') {
            stations = Object.values(data);
        }

        // 添加站点选项
        let hasStations = false;
        stations.forEach(item => {
            const row = item.properties || item;
            if (row['站点名称'] && row['站点名称'].trim() !== '') {
                const stationName = row['站点名称'].trim();
                const stationId = row['OBJECTID_1'] || stationName;
                stationSelect.add(new Option(stationName, stationId));

                // ===== 保留定位功能 =====
                if (row['坐标'] || (item.geometry && item.geometry.coordinates)) {
                    const coords = row['坐标'] || item.geometry.coordinates;
                    // 将坐标存储，方便之后定位
                    stationMarkers.set(stationId, {
                        lat: coords[1],
                        lng: coords[0],
                        name: stationName
                    });
                }
                // =====================

                hasStations = true;
            }
        });

        if (!hasStations) {
            stationSelect.innerHTML = '<option value="">未找到站点数据</option>';
        }
        
        stationSelect.disabled = false;
    } catch (error) {
        console.error('加载站点失败:', error);
        stationSelect.innerHTML = `<option value="">加载失败: ${error.message}</option>`;
    }
}

// 定位到选中的站点
stationSelect.addEventListener('change', function() {
    const stationId = this.value;
    if (stationId && stationMarkers.has(stationId)) {
        const station = stationMarkers.get(stationId);
            const [gcjLng, gcjLat] = wgs84ToGcj02(station.lng, station.lat);
        map.flyTo([gcjLat, gcjLng], 16, {
            duration: 0.8,
            easeLinearity: 0.25
        });
    }
});


    // 初始化线路选择
    function initLineSelect() {
        lineSelect.innerHTML = '<option value="">请选择线路</option>';
        
        Object.keys(lineToJsonMap).forEach(line => {
            const option = new Option(
                line.startsWith('S') ? `地铁${line}线` : `地铁${line}号线`,
                line
            );
            lineSelect.add(option);
        });
    }

    // 线路选择变化事件
    lineSelect.addEventListener('change', function() {
        loadStations(this.value);
    });

    // 初始化
    initLineSelect();
    
    // 如果有默认选中的线路，加载对应站点
    if (lineSelect.value) {
        loadStations(lineSelect.value);
    }
     // ===== 新增：范围圆增加 =====
    document.getElementById('rangeSelect').addEventListener('change', function() {
        if (lastSelectedStation) {
            updateRangeCircle(lastSelectedStation, parseInt(this.value));
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initMetroSelection);
// 地铁线路与站点联动功能



//定位站点功能
// ==================== 新增：站点定位相关变量 ====================
const stationMarkers = new Map(); // 存储站点标记 {stationId: {marker, lat, lng, name}}
let currentHighlight = null;      // 当前高亮的站点标记
// ============================================================

// ==================== 新增：站点定位功能函数 ====================
/**
 * 定位到指定站点
 * @param {string} stationId 站点ID
 */
function flyToStation(stationId) {
    if (!stationMarkers.has(stationId)) {
        console.warn(`站点${stationId}未找到标记`);
        return;
    }
    
    const station = stationMarkers.get(stationId);
    if (!map || !station) return;
    
    const [gcjLng, gcjLat] = wgs84ToGcj02(station.lng, station.lat);

    // 平滑动画移动到该站点（注意：Leaflet坐标顺序是 [lat, lng]）
    map.flyTo([gcjLat, gcjLng], 16, {
        duration: 0.8,
        easeLinearity: 0.25
    });
    
    
    // 打开弹出窗口
    setTimeout(() => {
        station.marker.openPopup();
    }, 800);
     // ===== 新增：记录站点并创建范围圆形 =====
    lastSelectedStation = { lat: station.lat, lng: station.lng };
    const radius = parseInt(document.getElementById('rangeSelect').value);
    updateRangeCircle(lastSelectedStation, radius);
}



/**
 * 清除所有站点标记
 */
function clearStationMarkers() {
    stationMarkers.forEach(station => {
        map.removeLayer(station.marker);
    });
    stationMarkers.clear();
    clearRangeCircle(); // 新增此行
}
// ==========站点选择和定位：170-380行============================




// ==========以下是范围圆功能============================
// ===== 新增：范围选择相关变量 =====
let currentRangeCircle = null;  // 当前范围圆形
let lastSelectedStation = null; // 最后选中的站点（记录中心点）
// ===== 新增：范围圆形操作函数 =====
function updateRangeCircle(station, radius) {
    // 移除旧圆形
    if (currentRangeCircle) map.removeLayer(currentRangeCircle);
 const [gcjLng, gcjLat] = wgs84ToGcj02(station.lng, station.lat);
 console.log('转换后坐标:', gcjLat, gcjLng);
    // 创建新圆形（浅蓝色半透明效果）
    currentRangeCircle = L.circle([gcjLat, gcjLng], {
        radius: radius,
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0.2,
        weight: 2
    }).addTo(map).bindTooltip(`半径: ${radius}m`, { permanent: false });
}

function clearRangeCircle() {
    if (currentRangeCircle) {
        map.removeLayer(currentRangeCircle);
        currentRangeCircle = null;
    }
}





/**
 * 获取当前站点指定半径范围内的POI名称列表
 * @param {number} radius 距离（米）
 * @returns {Promise<string[]>} 返回包含name字段的数组
 */
async function getNearbyPOIs() {
    if (!lastSelectedStation || !currentRangeCircle) return [];

    const radius = currentRangeCircle.getRadius();
    const poiUrl = 'merge/point-poi.geojson'; // 相对路径，请确保路径正确

    try {
        const response = await fetch(poiUrl);
        if (!response.ok) throw new Error(`POI数据加载失败: ${response.status}`);
        const geojson = await response.json();

        const stationLatLng = L.latLng(lastSelectedStation.lat, lastSelectedStation.lng);
        const matchedFeatures = [];

        for (const feature of geojson.features) {
            const props = feature.properties || {};
            const lng = props.lng || feature.geometry.coordinates[0];
            const lat = props.lat || feature.geometry.coordinates[1];
            const poiLatLng = L.latLng(lat, lng);
            const distance = stationLatLng.distanceTo(poiLatLng);

            if (distance <= radius && (props['线路名称'] === null || props['线路名称'] === undefined)) {
                feature._distance = Math.round(distance); // 保存距离用于展示
                matchedFeatures.push(feature);
            }
        }

        return matchedFeatures;
    } catch (err) {
        console.error('获取附近POI失败:', err);
        return [];
    }
}
function handlePoiClick(index) {
    const feature = lastQueriedPOIs[index];
    if (!feature) return;

    const props = feature.properties || {};
    const coords = feature.geometry.coordinates;
    const lat = props.lat || coords[1];
    const lng = props.lng || coords[0];
    
    const [gcjLng, gcjLat] = wgs84ToGcj02(lng, lat);

      const marker = L.marker([gcjLat, gcjLng]).addTo(map)
        .bindPopup(`<strong>${props.layer || '设施'}：</strong>${props.name || '无名'}<br>距离站点：${feature._distance}m`)
        .openPopup();
     poiMarkers.push(marker); 
    
 map.flyTo([gcjLat, gcjLng], 17, {
        duration: 0.8,
        easeLinearity: 0.25
    });

    // ✅ 添加到数组中
    poiMarkers.push(marker);
}

function clearPoiMarkers() {
    poiMarkers.forEach(marker => {
        map.removeLayer(marker);
    });
    poiMarkers.length = 0; // 清空数组
}


// 绑定查询周边POI按钮事件
document.getElementById('queryPoiBtn').addEventListener('click', async function () {
    clearPoiMarkers();
   
    const poiResults = document.getElementById('poiResults');
    const poiList = document.getElementById('poiList');

    poiResults.style.display = 'block';
    poiList.innerHTML = '<li>查询中...</li>';

      // 清除上一次查询的点
    poiMarkers.forEach(marker => map.removeLayer(marker));
    poiMarkers.length = 0;

    const pois = await getNearbyPOIs();
    lastQueriedPOIs = pois; // 保存查询到的 POI 列表

    if (pois.length === 0) {
        poiList.innerHTML = '<li>范围内暂无设施</li>';
    } else {
        poiList.innerHTML = pois.map((f, i) => {
            const props = f.properties || {};
            const name = props.name || '未命名';
            const layer = props.layer || '未分类';
            const distance = f._distance;
            return `<li style="margin-bottom:6px; cursor:pointer; color:#007bff;" onclick="handlePoiClick(${i})">
                        ${layer}：${name}（${distance}m）
                    </li>`;
        }).join('');

    }
});


