const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// отдаём все файлы (index.html, script.js, styles.css) из корня репозитория
app.use(express.static(__dirname));

// health-check для Render
app.get("/healthz", (req, res) => {
  res.send("ok");
});

// на всякий случай — все остальные маршруты ведут на index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
