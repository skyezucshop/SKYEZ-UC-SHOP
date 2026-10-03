const PACKS = [
  { id: '60', uc: 60, price: '79 ₽', amount: '79.00', label: 'Стартовый', image: 'pack-60.jpg' },
  { id: '325', uc: 325, price: '399 ₽', amount: '399.00', label: 'Популярный', popular: true, image: 'pack-325.jpg' },
  { id: '660', uc: 660, price: '799 ₽', amount: '799.00', label: 'Выгодный', image: 'pack-660.jpg' },
  { id: '1800', uc: 1800, price: '1 990 ₽', amount: '1990.00', label: 'Большой', image: 'pack-1800.jpg' },
  { id: '3850', uc: 3850, price: '3 990 ₽', amount: '3990.00', label: 'Премиум', image: 'pack-3850.jpg' },
  { id: '8100', uc: 8100, price: '7 990 ₽', amount: '7990.00', label: 'Максимум', image: 'pack-8100.jpg' }
];

const grid = document.getElementById('packGrid');
const select = document.getElementById('selectedPack');
const form = document.getElementById('orderForm');
const toast = document.getElementById('toast');
const previewImage = document.getElementById('selectedPreviewImage');
const previewText = document.getElementById('selectedPreviewText');
const submitButton = form?.querySelector('button[type="submit"]');

function formatUc(value) {
  return value.toLocaleString('ru-RU');
}

function renderPacks() {
  grid.innerHTML = PACKS.map(pack => `
    <article class="pack ${pack.popular ? 'popular' : ''}">
      ${pack.popular ? '<div class="badge">ПОПУЛЯРНЫЙ</div>' : ''}
      <img class="pack-image" src="${pack.image}" alt="${formatUc(pack.uc)} UC — ${pack.price}" loading="lazy">
      <div class="pack-body">
        <div class="pack-top">
          <div class="uc">${formatUc(pack.uc)} <span class="unit">UC</span></div>
          <div class="pack-label">${pack.label}</div>
        </div>
        <div class="price">${pack.price}</div>
        <button class="btn btn-dark choose" type="button" data-pack="${pack.id}">
          Выбрать <span>→</span>
        </button>
      </div>
    </article>
  `).join('');
}

function renderSelect() {
  select.innerHTML = PACKS.map(pack =>
    `<option value="${pack.id}">${formatUc(pack.uc)} UC — ${pack.price}</option>`
  ).join('');
}

function updatePreview(packId) {
  const pack = PACKS.find(item => item.id === packId) || PACKS[1];
  previewImage.src = pack.image;
  previewImage.alt = `${formatUc(pack.uc)} UC`;
  previewText.textContent = `${formatUc(pack.uc)} UC · ${pack.price}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function setLoading(loading) {
  submitButton.disabled = loading;
  submitButton.style.opacity = loading ? '0.65' : '';
  submitButton.innerHTML = loading ? 'Открываем Telegram…' : 'Отправить заявку <span>→</span>';
}

renderPacks();
renderSelect();
updatePreview(select.value);

grid.addEventListener('click', event => {
  const button = event.target.closest('.choose');
  if (!button) return;

  select.value = button.dataset.pack;
  updatePreview(select.value);

  document.getElementById('order').scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

  window.setTimeout(() => document.getElementById('nickname').focus(), 450);
});

select.addEventListener('change', () => updatePreview(select.value));

form.addEventListener('submit', event => {
  event.preventDefault();

  const data = new FormData(form);
  const packId = String(data.get('pack') || '');
  const pack = PACKS.find(item => item.id === packId);
  const nickname = String(data.get('nickname') || '').trim();
  const playerId = String(data.get('playerId') || '').trim();

  if (!pack || !nickname || !playerId) {
    showToast('Заполните все поля.');
    return;
  }

  if (!/^[0-9]{5,30}$/.test(playerId)) {
    showToast('Проверьте PUBG Mobile ID.');
    return;
  }

  setLoading(true);

  const message = [
    'Здравствуйте! Хочу оформить заказ в SKYEZ UC SHOP.',
    '',
    `Пакет: ${formatUc(pack.uc)} UC — ${pack.price}`,
    `Ник: ${nickname}`,
    `PUBG Mobile ID: ${playerId}`
  ].join('\n');

  const telegramUrl = `https://t.me/skyezq?text=${encodeURIComponent(message)}`;
  window.location.href = telegramUrl;
});

document.getElementById('year').textContent = new Date().getFullYear();
