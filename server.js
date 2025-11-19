const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// ЛОГ, чтобы точно знать, что запустился именно этот файл
console.log(">>> VOX miniapp server starting...");

// Отдаём статику из текущей папки (index.html, script.js, styles.css)
app.use(express.static(__dirname));

// Главная страница
app.get("/", (req, res) => {
  console.log(">>> GET /");
  res.sendFile(path.join(__dirname, "index.html"));
});

// Остальные пути тоже шлём на index.html
app.get("*", (req, res) => {
  console.log(">>> GET *", req.path);
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(">>> Server started on port", PORT);
});
