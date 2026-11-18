# OneTap.by

Сайт: https://soroka-dev.github.io/onetap-by/

Одностраничный сайт компании по производству NFC-стикеров. GitHub Pages публикует статическую версию сайта, а сайт вместе с API заявок разворачивается одним Cloudflare Worker.

## Что входит

- тёмный адаптивный лендинг с зелёным акцентом;
- сценарии: отзывы, переход на сайт, Wi-Fi и другое;
- форма с обязательными Telegram, телефоном, назначением и примерным количеством;
- отправка заявок в отдельного Telegram-бота;
- серверная проверка полей и honeypot против простого спама.

## Настройка Telegram

1. Создайте отдельного бота через BotFather и отправьте ему `/start`.
2. Узнайте свой `chat_id` через метод `getUpdates` Telegram Bot API.
3. Добавьте секреты в Cloudflare:

```sh
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

При использовании собственного домена можно также добавить `ALLOWED_ORIGIN`.

## Запуск

```sh
npm install
npm run dev
```

## Публикация

Статическая версия автоматически публикуется на GitHub Pages при каждом push в `main`.

Для рабочего приёма заявок через Telegram разверните Cloudflare Worker:

```sh
npm run deploy
```

Токен бота и `chat_id` нельзя коммитить в репозиторий.
