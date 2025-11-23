(function () {
  // ---------- ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ----------
  function setupTabs() {
    const buttons = document.querySelectorAll(".tab-btn");
    const screens = {
      home: document.getElementById("screen-home"),
      tech: document.getElementById("screen-tech"),
      challenges: document.getElementById("screen-challenges"),
      chat: document.getElementById("screen-chat"),
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");

        // активируем нужную вкладку
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // показываем нужный экран
        Object.keys(screens).forEach((key) => {
          screens[key].classList.toggle("active", key === target);
        });
      });
    });
  }

  // ---------- МОДАЛКА С ВИДЕО (ПОКА ЗАГЛУШКА) ----------
  function setupVideoModal() {
    const modal = document.getElementById("video-modal");
    const modalTitle = document.getElementById("video-modal-title");
    const modalText = document.getElementById("video-modal-text");
    const closeBtn = document.getElementById("video-modal-close");

    const videoButtons = document.querySelectorAll(".tile-btn[data-video]");

    function openModal(type) {
      if (type === "welcome") {
        modalTitle.textContent = "Приветственное видео";
        modalText.textContent =
          "Здесь будет видео-приветствие, где ты познакомишься с философией VOX.";
      } else if (type === "howto") {
        modalTitle.textContent = "Как пользоваться приложением";
        modalText.textContent =
          "Здесь будет видео-инструкция о том, как устроены разделы, как заниматься и где что искать.";
      } else {
        modalTitle.textContent = "Видео";
        modalText.textContent = "Здесь будет видео. Сейчас оно в процессе записи.";
      }
      modal.classList.add("active");
    }

    function closeModal() {
      modal.classList.remove("active");
    }

    videoButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const type = btn.getAttribute("data-video");
        openModal(type);
      });
    });

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // ---------- ПОЛУЧЕНИЕ TELEGRAM ID ----------
  function initTelegramId() {
    const userIdEl = document.getElementById("user-id");
    if (!userIdEl) return;

    function setText(text) {
      userIdEl.textContent = text;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 20; // 2 секунды по 100мс

    function tryInit() {
      attempts += 1;

      if (window.Telegram && window.Telegram.WebApp) {
        try {
          const tg = window.Telegram.WebApp;
          tg.ready();
          tg.expand && tg.expand();

          const user = tg.initDataUnsafe && tg.initDataUnsafe.user;

          if (user && user.id) {
            setText(String(user.id));
          } else {
            setText("нет данных");
          }
        } catch (e) {
          console.error("Ошибка Telegram WebApp:", e);
          setText("ошибка");
        }
        return;
      }

      if (attempts < MAX_ATTEMPTS) {
        setTimeout(tryInit, 100);
        return;
      }

      // если Telegram WebApp так и не появился — значит, открыт обычный браузер
      setText("откройте через Telegram");
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", tryInit);
    } else {
      tryInit();
    }
  }

  // ---------- СТАРТ ----------
  function onReady() {
    setupTabs();
    setupVideoModal();
    initTelegramId();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();


