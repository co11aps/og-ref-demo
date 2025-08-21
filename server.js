import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import serveStatic from "serve-static";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const publicDir = path.join(__dirname, "public");
const templatesDir = path.join(__dirname, "templates");

// Раздаём статик (SPA ассеты, картинки и т.д.)
app.use(serveStatic(publicDir, { index: false, setHeaders: setCacheHeaders }));

function setCacheHeaders(res, filePath) {
  // Базовые заголовки кэша (настрой по желанию)
  if (/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(filePath)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else {
    res.setHeader("Cache-Control", "no-store");
  }
}

// ===============================
// Вариант A: СТАТИЧЕСКИЙ ref.html
// ===============================
// Для всех /ref/* отдаём один и тот же подготовленный ref.html с OG-тегами
app.get("/ref/*", (req, res, next) => {
  const filePath = path.join(publicDir, "ref.html");
  res.type("html");
  res.set("Cache-Control", "no-store"); // чтобы удобно обновлять в тестах
  res.sendFile(filePath);
});

// ===============================
// Вариант B: ДИНАМИЧЕСКИЙ /ref/:code
// ===============================
// Раскомментируй этот блок и закомментируй статический, если хочешь динамику
/*
const template = fs.readFileSync(path.join(templatesDir, 'ref.template.html'), 'utf8');


// Пример источника данных — простой объект. На проде это может быть БД.
const REF_DATA = {
'abc123': {
title: 'Приглашение в BAGO от Олександра',
description: 'Зарегистрируйтесь по ссылке — получите приветственный бонус!',
image: '/og-image.png'
},
'vip777': {
title: 'VIP приглашение в BAGO',
description: 'Эксклюзивный бонус по персональной ссылке',
image: '/og-image.png'
}
};


app.get('/ref/:code', (req, res) => {
const { code } = req.params;
const data = REF_DATA[code] || {
title: 'Приглашение в BAGO',
description: 'Присоединяйтесь к BAGO по реферальной ссылке',
image: '/og-image.png'
};


const absoluteUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;


const html = template
.replaceAll('%%OG_TITLE%%', escapeHtml(data.title))
.replaceAll('%%OG_DESC%%', escapeHtml(data.description))
.replaceAll('%%OG_IMAGE%%', escapeHtml(makeAbsolute(req, data.image)))
.replaceAll('%%OG_URL%%', escapeHtml(absoluteUrl));


res.type('html');
res.set('Cache-Control', 'no-store');
res.send(html);
});
*/

// ===============================
// Все остальные маршруты — в SPA (index.html)
// ===============================
app.get("*", (req, res) => {
  res.type("html");
  res.sendFile(path.join(publicDir, "index.html"));
});

// ===============================
// Утилиты
// ===============================
function makeAbsolute(req, p) {
  if (!p.startsWith("http")) {
    return `${req.protocol}://${req.get("host")}${p}`;
  }
  return p;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`OG demo listening on http://localhost:${port}`);
});
