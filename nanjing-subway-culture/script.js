let allData = [];
let filters = {
  district: "全部",
  category: "全部",
  line: "全部"
};

// 加载数据
fetch('data/points.json')
  .then(res => res.json())
  .then(data => {
    allData = data;
    renderCards(allData);
  });

// 渲染卡片，支持关键词高亮
function renderCards(data, keyword = '') {
  const grid = document.querySelector('.card-grid');
  grid.innerHTML = '';
  const regex = new RegExp(`(${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');  // 转义特殊字符防止正则报错
  data.forEach(item => {
    // 多维筛选过滤
    if ((filters.district === '全部' || item.district === filters.district) &&
        (filters.category === '全部' || item.category === filters.category) &&
        (filters.line === '全部' || item.line === filters.line)) {

      // 名称关键词高亮处理
      const highlightedName = keyword ? item.name.replace(regex, '<mark>$1</mark>') : item.name;

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <a href="detail.html?placeId=${item.id}">
          <img src="${item.image}" alt="${item.name}">
        </a>
        <div class="title">${highlightedName}</div>
        <div class="desc">${item.description}</div>
        <div class="meta">★ ${item.likes} 👁 ${item.views}</div>
      `;
      grid.appendChild(card);
    }
  });

  // 如果筛选后无结果，提示一下用户
  if (grid.children.length === 0) {
    grid.innerHTML = '<p style="padding:20px; color:#666;">未找到符合条件的景点，请调整筛选或搜索关键词。</p>';
  }
}

// 绑定筛选与搜索事件
function setupFilterEvents() {
  // 筛选标签点击
  const options = document.querySelectorAll('.filter-option');
  options.forEach(option => {
    option.addEventListener('click', () => {
      const type = option.dataset.type;
      const value = option.dataset.value;

      // 切换同类标签激活状态
      document.querySelectorAll(`.filter-option[data-type='${type}']`).forEach(el => el.classList.remove('active'));
      option.classList.add('active');

      filters[type] = value;
      renderCards(allData);
    });
  });

  // 搜索框及按钮
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  function performSearch() {
    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword) {
      // 空关键词，显示全部
      renderCards(allData);
      return;
    }
    // 过滤名称包含关键词的，忽略大小写
    const result = allData.filter(item => item.name.toLowerCase().includes(keyword));
    renderCards(result, keyword);
  }

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

// 页面加载后初始化绑定
document.addEventListener('DOMContentLoaded', setupFilterEvents);
const userInput = document.getElementById('chatUserInput');
const sendBtn = document.getElementById('chatSendBtn');



