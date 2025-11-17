const tg = window.Telegram.WebApp;
tg.expand();

function openPage(pageName) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageName).classList.add("active");
}
