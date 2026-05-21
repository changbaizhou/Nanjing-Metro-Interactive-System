// 优先队列实现
class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }
    
    push(item) {
        this._heap.push(item);
        this._siftUp();
    }
    
    pop() {
        const item = this._heap[0];
        const last = this._heap.pop();
        if (this._heap.length > 0) {
            this._heap[0] = last;
            this._siftDown();
        }
        return item;
    }
    
    isEmpty() {
        return this._heap.length === 0;
    }
    
    _siftUp() {
        let node = this._heap.length - 1;
        while (node > 0) {
            const parent = (node - 1) >> 1;
            if (this._comparator(this._heap[node], this._heap[parent])) {
                [this._heap[parent], this._heap[node]] = [this._heap[node], this._heap[parent]];
                node = parent;
            } else {
                break;
            }
        }
    }
    
    _siftDown() {
        let node = 0;
        while (true) {
            const left = (node << 1) + 1;
            const right = (node << 1) + 2;
            let swap = node;
            
            if (left < this._heap.length && this._comparator(this._heap[left], this._heap[swap])) {
                swap = left;
            }
            if (right < this._heap.length && this._comparator(this._heap[right], this._heap[swap])) {
                swap = right;
            }
            
            if (swap !== node) {
                [this._heap[node], this._heap[swap]] = [this._heap[swap], this._heap[node]];
                node = swap;
            } else {
                break;
            }
        }
    }
}
class MetroPathFinder {
  constructor(graph) {
    this.graph = graph; // 接收从majormap.js传递的地铁图数据
    this.pathLayer = null; // 用于高亮显示路径的Leaflet图层
  }

  
 // 标准化站点名称（支持查询专用名称）
    normalizeStationName(inputName) {
        // 1. 检查是否为查询专用名
        if (this.graph.nameMapping && this.graph.nameMapping[inputName]) {
            return this.graph.nameMapping[inputName];
        }
        
        // 2. 检查是否为标准名
        if (this.graph.stations[inputName]) {
            return inputName;
        }
        
        // 3. 检查查询专用名（大小写不敏感）
        const lowerInput = inputName.toLowerCase();
        for (const officialName in this.graph.stations) {
            const station = this.graph.stations[officialName];
            if (station.queryName.toLowerCase() === lowerInput) {
                return officialName;
            }
        }
        
        // 4. 尝试去除"站"字
        const nameWithoutSuffix = inputName.replace(/站$/, '');
        if (this.graph.stations[nameWithoutSuffix]) {
            return nameWithoutSuffix;
        }
        
        return null;
    }
  // 最短路径算法 (Dijkstra实现)
 findShortestPath(start, end) {
    // 标准化站点名称
    start = this.normalizeStationName(start);
    end = this.normalizeStationName(end);
    
    if (!start || !end) {
        return { path: null, distance: 0, message: "站点名称无效" };
    }
    
    if (!this.graph.stations[start] || !this.graph.stations[end]) {
        return { path: null, distance: 0, message: "站点不存在" };
    }
    
    if (start === end) {
        return { 
            path: [start], 
            distance: 0, 
            message: "起点和终点相同" 
        };
    }

    // 使用优先队列的Dijkstra算法
    const distances = {};
    const previous = {};
    const visited = new Set();
    const queue = new PriorityQueue((a, b) => a.distance < b.distance);
    
    // 初始化
    Object.keys(this.graph.stations).forEach(station => {
        distances[station] = Infinity;
        previous[station] = null;
    });
    distances[start] = 0;
    queue.push({ station: start, distance: 0 });
    
    while (!queue.isEmpty()) {
        const current = queue.pop().station;
        
        if (current === end) break;
        if (visited.has(current)) continue;
        visited.add(current);
        
        if (!this.graph.connections[current]) continue;
        
        // 遍历邻居
        Object.entries(this.graph.connections[current]).forEach(([neighbor, dist]) => {
            const totalDistance = distances[current] + dist;
            
            if (totalDistance < distances[neighbor]) {
                distances[neighbor] = totalDistance;
                previous[neighbor] = current;
                queue.push({ station: neighbor, distance: totalDistance });
            }
        });
    }
    
    // 回溯路径
    const path = [];
    let current = end;
    while (current) {
        path.unshift(current);
        current = previous[current];
    }
    
    return {
        path: path.length > 1 ? path : null,
        distance: distances[end],
        message: path.length > 1 ? "成功找到路径" : "未找到路径"
    };
}

  // 高亮显示路径
  highlightPath(path, map) {
    this.clearPath(); // 清除旧路径
    
    const lineCoords = path.map(stationName => {
      return this.graph.stations[stationName].coords;
    });

    this.pathLayer = L.polyline(lineCoords, {
      color: '#00F5FF',
      weight: 8,
      opacity: 1,
      dashArray: '10, 10'
    }).addTo(map);

  
  }

  addStationMarker(stationName, label, map) {
    const station = this.graph.stations[stationName];
    L.marker(station.coords, {
      icon: L.divIcon({
        className: 'path-marker',
        html: `<div class="station-marker">${label}<br>${stationName}</div>`,
        iconSize: [80, 40]
      })
    }).addTo(map);
  }

  clearPath() {
    if (this.pathLayer) {
      this.pathLayer.remove();
      this.pathLayer = null;
    }
  }

  // 计算票价 (南京地铁计价规则)
  calculateFare(distance) {
    distance = distance / 1000; // 转为公里
    if (distance <= 10) return 2;
    if (distance <= 16) return 4;
    if (distance <= 22) return 6;
    if (distance <= 30) return 8;
    return 10; // 超过30公里6元封顶
  }

  // 计算预计时间
calculateTime(distance) {
  const baseSpeed = 2; // 短距离时每公里需要1分钟
  const speedDrop = 1.8; // 最低降到0.7分钟每公里
  const distanceKm = distance / 1000;

  // 距离越大，单位距离所需时间越少
  const timePerKm = baseSpeed - (speedDrop * (distanceKm / 20)); // 10km后最多下降speedDrop
  const adjustedTimePerKm = Math.max(timePerKm, 0.2); // 最少1.2分钟/km

  // 假设还有固定每站时间（上下车）
  const stationCount = distance / 1200; // 粗略估算每1.2km一个站
  const stopTime = stationCount * 1.8;   // 每站耗时1.8分钟（乘客上下）

  const runTime = distanceKm * adjustedTimePerKm;

  return Math.round(runTime + stopTime);
} 
  
}
// 确保全局可用
if (typeof window !== 'undefined') {
  window.MetroPathFinder = MetroPathFinder;
}
console.log("MetroPathFinder 类已定义"); // 调试日志