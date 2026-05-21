// 模拟加载的GeoJSON数据
const geojsonFiles = [
    { path: 'map_geojson/S9_point.json', label: 'S9 点' },
    { path: 'map_geojson/S8_point.json', label: 'S8 点' },
    { path: 'map_geojson/S7_point.json', label: 'S7 点' },
    { path: 'map_geojson/S6_point.json', label: 'S6 点' },
    { path: 'map_geojson/S3_point.json', label: 'S3 点' },
    { path: 'map_geojson/S1_point.json', label: 'S1 点' },
    { path: 'map_geojson/10_point.json', label: '10 点' },
    { path: 'map_geojson/7_point.json', label: '7 点' },
    { path: 'map_geojson/5_point.json', label: '5 点' },
    { path: 'map_geojson/4_point.json', label: '4 点' },
    { path: 'map_geojson/3_point.json', label: '3 点' },
    { path: 'map_geojson/2_point.json', label: '2 点' },
    { path: 'map_geojson/1_point.json', label: '1 点' },
    { path: 'map_geojson/S9_line.json', label: 'S9 线', isLine: true, color: '#d39c2e' },
    { path: 'map_geojson/S8_line.json', label: 'S8 线', isLine: true, color: '#ea7600' },
    { path: 'map_geojson/S7_line.json', label: 'S7 线', isLine: true, color: '#e89cae' },
    { path: 'map_geojson/S6_line.json', label: 'S6 线', isLine: true, color: '#e89abe' },
    { path: 'map_geojson/S3_line.json', label: 'S3 线', isLine: true, color: '#8d5779' },
    { path: 'map_geojson/S1_line.json', label: 'S1 线', isLine: true, color: '#00b2a9' },
    { path: 'map_geojson/10_line.json', label: '10 线', isLine: true, color: '#b9975b' },
    { path: 'map_geojson/7_line.json', label: '7 线', isLine: true, color: '#40de5a' },
    { path: 'map_geojson/5_line.json', label: '5 线', isLine: true, color: '#fdda25' },
    { path: 'map_geojson/4_line.json', label: '4 线', isLine: true, color: '#7d55c7' },
    { path: 'map_geojson/3_line.json', label: '3 线', isLine: true, color: '#009a44' },
    { path: 'map_geojson/2_line.json', label: '2 线', isLine: true, color: '#a6093d' },
    { path: 'map_geojson/1_line.json', label: '1 线', isLine: true, color: '#009ace' }
];

// 切换 sidebar 的显示与隐藏
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
    
    const lineList = document.getElementById("line-list");
    if (lineList.style.display === "none") {
        lineList.style.display = "block"; // 展开线路列表
    } else {
        lineList.style.display = "none"; // 收起线路列表
    }
}

// 假设通过 `geojsonFiles` 来获取各条线路和站点数据
const lineListContainer = document.getElementById("line-list");
geojsonFiles.filter(item => item.isLine).forEach((line) => {
    const lineItem = document.createElement("div");
    lineItem.classList.add("line-item");
    lineItem.innerText = line.label;

    // 点击线路时，加载该线路的站点
    lineItem.onclick = () => loadStationsForLine(line);
    lineListContainer.appendChild(lineItem);
});

// 加载线路的站点
function loadStationsForLine(line) {
    // 假设每条线路有对应的站点数据，使用 `path` 来读取
    const stations = geojsonFiles.filter(item => item.path.includes(line.label.toLowerCase()));

    const stationListContainer = document.getElementById("station-list");
    stationListContainer.innerHTML = '';  // 清空之前的站点列表

    stations.forEach(station => {
        const stationItem = document.createElement("div");
        stationItem.classList.add("station-item");
        stationItem.innerText = station.label;  // 假设 station.label 是站点名称
        stationItem.onclick = () => zoomToStation(station); // 点击站点，缩放地图到该站点
        stationListContainer.appendChild(stationItem);
    });

    // 显示站点列表
    document.getElementById("station-list-container").style.display = 'block';
}

// 缩放地图到某个站点
function zoomToStation(station) {
    // 假设站点数据中包含坐标信息
    if (station.geometry) {
        map.setView([station.geometry.coordinates[1], station.geometry.coordinates[0]], 16);
    }
}
