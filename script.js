const TELEGRAM_USERNAME = 'skyezq';
const TELEGRAM_URL = `https://t.me/${TELEGRAM_USERNAME}`;

const PACKS = [
  { id: '60', uc: 60, price: '79 ₽', label: 'Стартовый', image: 'pack-60.jpg' },
  { id: '325', uc: 325, price: '399 ₽', label: 'Популярный', popular: true, image: 'pack-325.jpg' },
  { id: '660', uc: 660, price: '799 ₽', label: 'Выгодный', image: 'pack-660.jpg' },
  { id: '1800', uc: 1800, price: '1 990 ₽', label: 'Большой', image: 'pack-1800.jpg' },
  { id: '3850', uc: 3850, price: '3 990 ₽', label: 'Премиум', image: 'pack-3850.jpg' },
  { id: '8100', uc: 8100, price: '7 990 ₽', label: 'Максимум', image: 'pack-8100.jpg' },
];

const grid = document.getElementById('packGrid');
const select = document.getElementById('selectedPack');
const form = document.getElementById('orderForm');
const toast = document.getElementById('toast');
const previewImage = document.getElementById('selectedPreviewImage');
const previewText = document.getElementById('selectedPreviewText');

function formatUc(value) {
  return value.toLocaleString('ru-RU');
}

function renderPacks() {
  grid.innerHTML = PACKS.map((pack) => `
    <article class="pack ${pack.popular ? 'popular' : ''}">
      ${pack.popular ? '<div class="badge">ПОПУЛЯРНЫЙ</div>' : ''}
      <img class="pack-image" src="${pack.image}" alt="${formatUc(pack.uc)} UC — ${pack.price}" loading="lazy" />
      <div class="pack-body">
        <div class="pack-top">
          <div class="uc">${formatUc(pack.uc)} <span class="unit">UC</span></div>
          <div class="pack-label">${pack.label}</div>
        </div>
        <div class="price">${pack.price}</div>
        <button class="btn btn-ghost choose" type="button" data-pack="${pack.id}">Выбрать <span>→</span></button>
      </div>
    </article>
  `).join('');
}

function renderSelect() {
  select.innerHTML = PACKS.map((pack) =>
    `<option value="${pack.id}">${formatUc(pack.uc)} UC — ${pack.price}</option>`
  ).join('');
}

function updatePreview(packId) {
  const pack = PACKS.find((item) => item.id === packId) || PACKS[1];
  previewImage.src = pack.image;
  previewImage.alt = `${formatUc(pack.uc)} UC`;
  previewText.textContent = `${formatUc(pack.uc)} UC · ${pack.price}`;
}

renderPacks();
renderSelect();
updatePreview(select.value);

grid.addEventListener('click', (event) => {
  const button = event.target.closest('.choose');
  if (!button) return;
  select.value = button.dataset.pack;
  updatePreview(select.value);
  document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => document.getElementById('nickname').focus(), 450);
});

select.addEventListener('change', () => updatePreview(select.value));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const pack = PACKS.find((item) => item.id === data.get('pack'));
  const nickname = String(data.get('nickname') || '').trim();
  const playerId = String(data.get('playerId') || '').trim();

  if (!pack || !nickname || !playerId) {
    showToast('Заполните все поля.');
    return;
  }

  const message = [
    'Здравствуйте! Хочу заказать UC.',
    `Ник: ${nickname}`,
    `PUBG Mobile ID: ${playerId}`,
    `Пакет: ${formatUc(pack.uc)} UC`,
    `Цена на сайте: ${pack.price}`,
  ].join('\n');

  const url = `${TELEGRAM_URL}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  showToast('Telegram откроется с готовым заказом.');
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

document.getElementById('year').textContent = new Date().getFullYear();
