const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// адрес твоего сервера
const BACKEND_URL = 'https://miniapp-server-9atc.onrender.com';

let isPaid = false;

// проверяем, оплатил ли пользователь
async function checkAccess() {
  try {
    const user = tg.initDataUnsafe?.user;
    if (!user) {
      openPage('pay');
      return;
    }

    const res = await fetch(
      `${BACKEND_URL}/check?user_id=${user.id}`
    );
    const data = await res.json();

    isPaid = !!data.paid;
    openPage(isPaid ? 'home' : 'pay');
  } catch (e) {
    console.error(e);
    openPage('pay');
  }
}

function openPage(pageName) {
  // если нет оплаты — разрешаем только страницу pay
  if (!isPaid && pageName !== 'pay') {
    pageName = 'pay';
  }

  document.querySelectorAll('.page')
    .forEach(p => p.classList.remove('active'));

  const page = document.getElementById(pageName);
  if (page) page.classList.add('active');
}

// запускаем проверку при открытии мини-аппа
checkAccess();
