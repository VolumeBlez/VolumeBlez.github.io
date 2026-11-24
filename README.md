# Портфолио Unity Developer на GitHub Pages

Одностраничный сайт без сборщиков и зависимостей: `index.html`, `styles.css`, `script.js` и картинки в `assets/`.

## 1. Замени заглушки на своё

Открой `index.html` и найди комментарии `<!-- TODO: ... -->`. Что меняем:

| Где | Что |
| --- | --- |
| `<title>`, `<meta name="description">`, og-теги | Имя и описание |
| `.logo__text` | Своё имя / ник |
| Hero | Текст о себе, ссылки в `.socials`, кнопки |
| `.stats` | Свои цифры |
| `#about` | Опыт, даты и компании в `.timeline` |
| `#about` → `.stack-block` | Свой стек (блок теперь внутри «О себе») |
| `#cases` | Названия кейсов, описания, метрики, теги |
| `#contacts`, footer | Почта, Telegram, GitHub, LinkedIn, год |

Все ссылки вида `https://github.com/`, `https://t.me/`, `mailto:hello@example.com` — заглушки.

### Картинки и гифки

В папке `assets/` лежат SVG-заглушки: `hero-preview.svg`, `case-1.svg` … `case-4.svg`.

1. Положи свои файлы рядом, например `assets/case-1.gif`, `assets/case-2.png`.
2. В нужном кейсе замени в теге `<img>` атрибут `src="assets/case-1.svg"` на свой файл.
3. В кнопке `.case__media` замени `data-media="assets/case-1.svg"` на тот же файл — тогда по клику откроется полноразмерная гифка/картинка.
4. Обнови `alt` и `data-caption`.

Совет: для гифок держи размер до ~5–10 МБ, иначе сайт долго грузится. Крупные видео лучше залить на YouTube и вставить превью со ссылкой.

## 2. Запуск локально (необязательно)

Просто открой `index.html` в браузере. Или через локальный сервер:

```bash
python -m http.server 8000
# http://localhost:8000
```

## 3. Публикация на GitHub Pages

**Вариант А — сайт на корне домена `username.github.io`**

1. Создай репозиторий с именем строго `<твой-логин>.github.io` (например, `ivanhub.github.io`), публичный.
2. В папке проекта:

```bash
git init
git add .
git commit -m "Portfolio: initial commit"
git branch -M main
git remote add origin https://github.com/<твой-логин>/<твой-логин>.github.io.git
git push -u origin main
```

3. В репозитории: **Settings → Pages → Build and deployment**.
   - Source: **Deploy from a branch**
   - Branch: **main**, папка **/ (root)**
   - Save.
4. Через 1–2 минуты сайт будет доступен по адресу `https://<твой-логин>.github.io/`.

**Вариант Б — репозиторий с любым именем, например `portfolio`**

Всё так же, но адрес будет `https://<твой-логин>.github.io/portfolio/`.
Относительные пути (`styles.css`, `assets/...`) уже работают для этого случая — ничего править не нужно.

## 4. Обновление сайта

```bash
git add .
git commit -m "Update cases"
git push
```

GitHub Pages сам пересоберёт страницу за минуту.

## 5. Свой домен (по желанию)

Settings → Pages → Custom domain, впиши домен. В корне репозитория появится файл `CNAME`.
Если используешь Cloudflare или другой DNS, добавь CNAME-запись на `<твой-логин>.github.io`.

---

Готово. Если хочешь поменять цветовую схему — все цвета и размеры собраны в `:root` в начале `styles.css`.
