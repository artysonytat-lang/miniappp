// server.js — сервер мини-приложения VOX с API чата

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- НАСТРОЙКА БАЗЫ ДАННЫХ ----------

let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  console.log("PostgreSQL pool создан");
} else {
  console.warn("DATABASE_URL не задан — чат работать не будет");
}

// создаём таблицу messages при старте
async function initDb() {
  if (!pool) return;
  const sql = `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      user_name TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await pool.query(sql);
  console.log("Таблица messages проверена/создана");
}

initDb().catch((err) => {
  console.error("Ошибка инициализации БД:", err);
});

// ---------- MIDDLEWARE ----------

app.use(express.json());

// статика: index.html, script.js, styles.css лежат в корне
const publicDir = __dirname;
app.use(express.static(publicDir));

// корень — просто отдаём index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ---------- API ЧАТА ----------

// GET /api/chat/messages?after=ISO
app.get("/api/chat/messages", async (req, res) => {
  if (!pool) {
    return res.json({ messages: [] });
  }

  const { after } = req.query;
  try {
    let result;
    if (after) {
      result = await pool.query(
        `
        SELECT id, user_id, user_name, text,
               created_at,
               to_char(created_at AT TIME ZONE 'Europe/Moscow', 'HH24:MI') as time
        FROM messages
        WHERE created_at > $1
        ORDER BY created_at ASC
        LIMIT 50
      `,
        [after]
      );
    } else {
      result = await pool.query(
        `
        SELECT id, user_id, user_name, text,
               created_at,
               to_char(created_at AT TIME ZONE 'Europe/Moscow', 'HH24:MI') as time
        FROM messages
        ORDER BY created_at DESC
        LIMIT 50
      `
      );
      // чтобы в чате было по возрастанию времени
      result.rows.reverse();
    }

    res.json({ messages: result.rows });
  } catch (e) {
    console.error("Ошибка GET /api/chat/messages:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// POST /api/chat/messages
// body: { userId, userName, text }
app.post("/api/chat/messages", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "no_database" });
  }

  try {
    const { userId, userName, text } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "empty_text" });
    }

    const uid = Number(userId) || 0;
    const uname = (userName || "Участник").toString().slice(0, 64);
    const bodyText = text.toString().slice(0, 2000);

    const result = await pool.query(
      `
      INSERT INTO messages (user_id, user_name, text)
      VALUES ($1, $2, $3)
      RETURNING id,
                user_id,
                user_name,
                text,
                created_at,
                to_char(created_at AT TIME ZONE 'Europe/Moscow', 'HH24:MI') as time
    `,
      [uid, uname, bodyText]
    );

    res.json({ message: result.rows[0] });
  } catch (e) {
    console.error("Ошибка POST /api/chat/messages:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ---------- СТАРТ СЕРВЕРА ----------

app.listen(PORT, () => {
  console.log(`VOX miniapp server listening on port ${PORT}`);
});

