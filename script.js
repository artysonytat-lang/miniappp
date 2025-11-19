(function () {
  const userIdEl = document.getElementById("user-id");
  if (!userIdEl) return;

  function setText(text) {
    userIdEl.textContent = text;
  }

  let attempts = 0;
  const MAX_ATTEMPTS = 20; // 20 * 100мс = 2 секунды

  function tryInit() {
    attempts += 1;

    // Если Telegram.WebApp уже есть — работаем с ним
    if (window.Telegram && window.Telegram.WebApp) {
      try {
        const tg = window.Telegram.WebApp;
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
      return;
    }

    // Если Telegram.WebApp ещё не появился, но попытки не закончились — ждём
    if (attempts < MAX_ATTEMPTS) {
      setTimeout(tryInit, 100);
      return;
    }

    // Если так и не дождались — значит, это обычный браузер
    setText("Откройте через Telegram-бота");
  }

  // Стартуем после загрузки DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryInit);
  } else {
    tryInit();
  }
})();
