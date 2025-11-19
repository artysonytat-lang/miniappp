// Минимальный скрипт для VOX mini-app
(function () {
  const userIdEl = document.getElementById("user-id");
  if (!userIdEl) return;

  function setText(text) {
    userIdEl.textContent = text;
  }

  // Если Telegram.WebApp недоступен — значит страница открыта в обычном браузере
  if (!window.Telegram || !window.Telegram.WebApp) {
    setText("Откройте через Telegram-бота");
    return;
  }

  const tg = window.Telegram.WebApp;

  try {
    tg.ready();
    tg.expand && tg.expand();

    const user = tg.initDataUnsafe && tg.initDataUnsafe.user;

    if (user && user.id) {
      setText(String(user.id));
    } else {
      setText("Не удалось получить ID, откройте через кнопку в боте");
    }
  } catch (e) {
    console.error("Ошибка при работе с Telegram WebApp:", e);
    setText("Ошибка при получении ID");
  }
})();
