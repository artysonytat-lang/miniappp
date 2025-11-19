const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// адрес твоего сервера
const BACKEND_URL = 'https://miniapp-server-9atc.onrender.com';

// какие вкладки платные
const paidPages = ['technique', 'challenges'];

let isPaid = false;

// показать Telegram ID на экране оплаты
function showUserId(user) {
  const el = document.getElementById('user-id');
  if (!el) return;
  if (user && user.id) {
    el.textContent = user.id;
  } else {
    el.textContent = 'не удалось получить ID';
  }
}

// обновить видимость блоков .paid-only (на будущее)
function updatePaidBlocks() {
  document.querySelectorAll('.paid-only').forEach(el => {
    el.style.display = isPaid ? 'block' : 'none';
  });
}

// проверяем, есть ли оплата
async function checkAccess() {
  try {
    const user = tg.initDataUnsafe?.user;
    showUserId(user);

    if (!user) {
      openPage('pay');
      return;
    }

    const res = await fetch(
      `${BACKEND_URL}/check?user_id=${user.id}`
    );
    const data = await res.json();

    isPaid = !!data.paid;
    updatePaidBlocks();
    openPage(isPaid ? 'home' : 'pay');
  } catch (e) {
    console.error(e);
    openPage('pay');
  }
}

// переключение вкладок
function openPage(pageName) {
  // если пользователь не оплатил — не пускаем на платные вкладки
  if (!isPaid && paidPages.includes(pageName)) {
    pageName = 'pay';
  }

  document.querySelectorAll('.page')
    .forEach(p => p.classList.remove('active'));

  const page = document.getElementById(pageName);
  if (page) page.classList.add('active');
}

// запускаем проверку при открытии Mini App
checkAccess();


  document.querySelectorAll('.page')
    .forEach(p => p.classList.remove('active'));

  const page = document.getElementById(pageName);
  if (page) page.classList.add('active');
}

// запускаем проверку при открытии мини-аппа
checkAccess();

