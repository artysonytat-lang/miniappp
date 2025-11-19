const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Отдаём статику (index.html, script.js, styles.css) из корня репозитория
app.use(express.static(__dirname));

// Явно обрабатываем запрос к главной странице
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// На всякий случай: все остальные пути тоже ведут на index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
