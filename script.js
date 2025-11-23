(function () {
  // ---------- ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ----------
  function setupTabs() {
    const buttons = document.querySelectorAll(".tab-btn");
    const screens = {
      home: document.getElementById("screen-home"),
      tech: document.getElementById("screen-tech"),
      challenges: document.getElementById("screen-challenges"),
      chat: document.getElementById("screen-chat")
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");

        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        Object.keys(screens).forEach((key) => {
          screens[key].classList.toggle("active", key === target);
        });
      });
    });
  }

  // ---------- МОДАЛКА ДЛЯ ВИДЕО (пока заглушка) ----------
  function setupVideoModal() {
    const modal = document.getElementById("video-modal");
    const modalTitle = document.getElementById("video-modal-title");
    const modalText = document.getElementById("video-modal-text");
    const closeBtn = document.getElementById("video-modal-close");

    const cards = document.querySelectorAll(".glow-card");

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

    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const type = card.getAttribute("data-video");
        openModal(type);
      });
    });

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
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
    const MAX_ATTEMPTS = 20;

    function tryInit() {
      attempts += 1;

      if (window.Telegram && window.Telegram.WebApp) {
        try {
          const tg = window.Telegram.WebApp;
          tg.ready();
          if (tg.expand) tg.expand();

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

      setText("откройте через Telegram");
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", tryInit);
    } else {
      tryInit();
    }
  }

  // ---------- ВНУТРЕННИЙ ЧАТ (локальный, в localStorage) ----------
  function setupChat() {
    const form = document.getElementById("chat-form");
    const input = document.getElementById("chat-input");
    const listEl = document.getElementById("chat-messages");
    if (!form || !input || !listEl) return;

    const STORAGE_KEY = "vox_local_chat";
    let messages = [];

    function load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          messages = JSON.parse(raw);
        } else {
          messages = [];
        }
      } catch (e) {
        console.error("Ошибка чтения чата:", e);
        messages = [];
      }
    }

    function save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error("Ошибка сохранения чата:", e);
      }
    }

    function render() {
      listEl.innerHTML = "";
      messages.forEach((m) => {
        const wrap = document.createElement("div");
        wrap.className = "chat-message";

        const meta = document.createElement("div");
        meta.className = "chat-message-meta";
        meta.textContent = m.time || "";

        const text = document.createElement("div");
        text.textContent = m.text;

        wrap.appendChild(meta);
        wrap.appendChild(text);
        listEl.appendChild(wrap);
      });

      listEl.scrollTop = listEl.scrollHeight;
    }

    load();
    render();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = (input.value || "").trim();
      if (!value) return;

      const now = new Date();
      const time = now.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
      });

      messages.push({
        text: value,
        time: time
      });

      input.value = "";
      save();
      render();
    });
  }

  // ---------- СТАРТ ----------
  function onReady() {
    setupTabs();
    setupVideoModal();
    initTelegramId();
    setupChat(); // внутренняя вкладка Чат
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();


