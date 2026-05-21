// script.js
const cardGrid = document.getElementById('cardGrid');
const searchInput = document.querySelector('.search-group input');
const searchButton = document.querySelector('.btn-blue');
const filters = document.querySelectorAll('.filter-option');

let allData = [];
let selectedFilters = {
  line: '全部',
  category: '全部',
  grade: '全部',
  season: '全部',
  street: '全部',
  district: '全部'
};

fetch('data/details.json')
  .then(res => res.json())
  .then(data => {
    allData = data;
    renderCards(data);
  });

function renderCards(data) {
  cardGrid.innerHTML = '';
  const filteredData = data.filter(item => {
    return Object.keys(selectedFilters).every(key =>
      selectedFilters[key] === '全部' || item[key] === selectedFilters[key]
    );
  });

  const searchTerm = searchInput.value.trim().toLowerCase();
  const searchedData = filteredData.filter(item =>
    item.name.toLowerCase().includes(searchTerm)
  );

  if (searchedData.length === 0) {
    cardGrid.innerHTML = '<p>未找到符合条件的景点。</p>';
    return;
  }

  searchedData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.images[0]}" alt="${item.name}" />
      <div class="title">${item.name}</div>
      <div class="desc">${item.description}</div>
      <div class="meta">浏览量：${item.views} · 点赞数：${item.likes}</div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `detail.html?placeId=${item.id}`;
    });
    cardGrid.appendChild(card);
  });
}

searchButton.addEventListener('click', () => {
  renderCards(allData);
});

filters.forEach(span => {
  span.addEventListener('click', () => {
    const type = span.getAttribute('data-type');
    const value = span.getAttribute('data-value');
    selectedFilters[type] = value;

    // 更新 UI
    document.querySelectorAll(`.filter-option[data-type="${type}"]`).forEach(s => s.classList.remove('active'));
    span.classList.add('active');

    renderCards(allData);
  });
});
