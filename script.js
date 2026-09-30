const TELEGRAM_USERNAME = 'skyezq';
const TELEGRAM_URL = `https://t.me/${TELEGRAM_USERNAME}`;

// Прайс в рублях. При необходимости измените значения здесь.
const PACKS = [
  { id: '60', uc: 60, price: 79, label: 'Стартовый' },
  { id: '325', uc: 325, price: 399, label: 'Популярный', popular: true },
  { id: '660', uc: 660, price: 799, label: 'Выгодный' },
  { id: '1800', uc: 1800, price: 1990, label: 'Большой' },
  { id: '3850', uc: 3850, price: 3990, label: 'Премиум' },
  { id: '8100', uc: 8100, price: 7990, label: 'Максимум' },
];

const grid = document.getElementById('packGrid');
const select = document.getElementById('selectedPack');
const form = document.getElementById('orderForm');
const toast = document.getElementById('toast');
const rub = value => `${value.toLocaleString('ru-RU')} ₽`;

grid.innerHTML = PACKS.map(pack => `
  <article class="pack ${pack.popular ? 'popular' : ''}">
    ${pack.popular ? '<div class="badge">ПОПУЛЯРНЫЙ</div>' : ''}
    <div class="uc">${pack.uc.toLocaleString('ru-RU')} <span class="unit">UC</span></div>
    <small>${pack.label}</small>
    <div class="price">${rub(pack.price)}</div>
    <button class="btn btn-ghost choose" type="button" data-pack="${pack.id}">Выбрать</button>
  </article>
`).join('');

select.innerHTML = PACKS.map(pack =>
  `<option value="${pack.id}">${pack.uc.toLocaleString('ru-RU')} UC — ${rub(pack.price)}</option>`
).join('');

document.querySelectorAll('.choose').forEach(button => {
  button.addEventListener('click', () => {
    select.value = button.dataset.pack;
    document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => document.getElementById('nickname').focus(), 450);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const pack = PACKS.find(item => item.id === data.get('pack'));
  const nickname = String(data.get('nickname')).trim();
  const playerId = String(data.get('playerId')).trim();

  const message = [
    'Здравствуйте! Хочу заказать UC.',
    `Ник: ${nickname}`,
    `PUBG Mobile ID: ${playerId}`,
    `Пакет: ${pack.uc} UC`,
    `Цена на сайте: ${rub(pack.price)}`
  ].join('\n');

  const url = `${TELEGRAM_URL}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  showToast('Заказ подготовлен — открываю Telegram.');
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

document.getElementById('year').textContent = new Date().getFullYear();

const promoImages = [...document.querySelectorAll('.promo-image')];
const promoDots = [...document.querySelectorAll('.promo-dot')];
let promoIndex = 0;
function setPromo(index) {
  promoIndex = index;
  promoImages.forEach((img, i) => img.classList.toggle('active', i === index));
  promoDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}
promoDots.forEach((dot, i) => dot.addEventListener('click', () => setPromo(i)));
if (promoImages.length > 1) setInterval(() => setPromo((promoIndex + 1) % promoImages.length), 5000);
