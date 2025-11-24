(function () {
  let currentUser = {
    id: null,
    name: "Гость",
  };

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

        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        Object.keys(screens).forEach((key) => {
          screens[key].classList.toggle("active", key === target);
        });
      });
    });
  }

  // ---------- МОДАЛКА ВИДЕО ----------
  function setupVideoModal() {
    const modal = document.getElementById("video-modal");
    const modalTitle = document.getElementById("video-modal-title");
    const modalText = document.getElementById("video-modal-text");
    const closeBtn = document.getElementById("video-modal-close");
    const cards = document.querySelectorAll(".video-card");

    if (!modal || !modalTitle || !modalText || !closeBtn) return;

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

  // ---------- TELEGRAM USER ----------
  function initTelegramUser() {
    const userIdEl = document.getElementById("user-id");
    const userNameEl = document.getElementById("user-name");
    const avatarEl = document.getElementById("user-avatar");
    if (!userIdEl) return;

    function setIdText(text) {
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
            currentUser.id = user.id;
            currentUser.name =
              user.first_name ||
              user.last_name ||
              user.username ||
              "Участник";

            setIdText(String(user.id));

            // Имя в профиль
            if (userNameEl) {
              userNameEl.textContent = currentUser.name;
            }

            // Рандомный emoji-аватар
            if (avatarEl) {
              const emojis = ["🦊","🐸","🦁","🐼","🐨","🐯","🕊️","🌿","🎧","✨"];
              const index = currentUser.id
                ? currentUser.id % emojis.length
                : Math.floor(Math.random() * emojis.length);
              avatarEl.textContent = emojis[index];
            }
          } else {
            setIdText("нет данных");
          }
        } catch (e) {
          console.error("Ошибка Telegram WebApp:", e);
          setIdText("ошибка");
        }
        return;
      }

      if (attempts < MAX_ATTEMPTS) {
        setTimeout(tryInit, 100);
        return;
      }

      setIdText("откройте через Telegram");
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", tryInit);
    } else {
      tryInit();
    }
  }

  // ---------- КНОПКА ОПЛАТЫ ЧЕРЕЗ БОТА ----------
  function setupPayButton() {
    const btn = document.getElementById("pay-btn");
    if (!btn) return;

    const botLink = "https://t.me/voxvik_bot?start=pay";

    btn.addEventListener("click", (e) => {
      e.preventDefault();

      // Вариант 1: мини-приложение запущено внутри Telegram
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;

        tg.sendData(
          JSON.stringify({
            action: "pay",
          })
        );

        tg.close();
        return;
      }

      // Вариант 2: открыто в браузере
      window.open(botLink, "_blank");
    });
  }

  // ---------- ЧАТ (API) ----------
  const CHAT_API_BASE = "/api/chat";

  function setupChat() {
    const form = document.getElementById("chat-form");
    const input = document.getElementById("chat-input");
    const listEl = document.getElementById("chat-messages");
    if (!form || !input || !listEl) return;

    let messages = [];
    let isLoading = false;
    let lastTimestamp = null;

    function render() {
      listEl.innerHTML = "";
      messages.forEach((m) => {
        const wrap = document.createElement("div");
        const isOwn = currentUser.id && m.user_id === currentUser.id;
        wrap.className = "chat-message " + (isOwn ? "own" : "foreign");

        const header = document.createElement("div");
        header.className = "chat-message-header";

        const nameEl = document.createElement("div");
        nameEl.className = "chat-message-name";
        nameEl.textContent = m.user_name || "Участник";

        const timeEl = document.createElement("div");
        timeEl.className = "chat-message-time";
        timeEl.textContent = m.time || "";

        header.appendChild(nameEl);
        header.appendChild(timeEl);

        const textEl = document.createElement("div");
        textEl.className = "chat-message-text";
        textEl.textContent = m.text;

        wrap.appendChild(header);
        wrap.appendChild(textEl);
        listEl.appendChild(wrap);
      });

      listEl.scrollTop = listEl.scrollHeight;
    }

    async function fetchMessages(initial = false) {
      if (isLoading) return;
      isLoading = true;
      try {
        const url = lastTimestamp
          ? `${CHAT_API_BASE}/messages?after=${encodeURIComponent(
              lastTimestamp
            )}`
          : `${CHAT_API_BASE}/messages`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Ошибка загрузки чата");
        const data = await res.json();

        if (Array.isArray(data.messages) && data.messages.length > 0) {
          if (initial) {
            messages = data.messages;
          } else {
            messages = messages.concat(data.messages);
          }

          const last = data.messages[data.messages.length - 1];
          lastTimestamp = last.created_at;
          render();
        }
      } catch (e) {
        console.error(e);
      } finally {
        isLoading = false;
      }
    }

    async function sendMessage(text) {
      if (!text.trim()) return;
      try {
        const payload = {
          userId: currentUser.id,
          userName: currentUser.name,
          text: text.trim(),
        };

        const res = await fetch(`${CHAT_API_BASE}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Ошибка отправки сообщения");
        const data = await res.json();
        if (data && data.message) {
          messages.push(data.message);
          lastTimestamp = data.message.created_at;
          render();
        }
      } catch (e) {
        console.error(e);
      }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = (input.value || "").trim();
      if (!value) return;
      input.value = "";
      sendMessage(value);
    });

    // начальная загрузка
    fetchMessages(true);

    // периодическая подгрузка новых
    setInterval(() => {
      fetchMessages(false);
    }, 3000);
  }

  // ---------- СТАРТ ----------
  function onReady() {
    setupTabs();
    setupVideoModal();
    initTelegramUser();
    setupPayButton();
    setupChat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
