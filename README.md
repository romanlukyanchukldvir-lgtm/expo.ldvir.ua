# LDVIR.UA Tools Expo Landing

Односторінковий landing page для події **LDVIR.UA — Виставка інструментів**.

Основна дія сторінки — реєстрація через Telegram-бот:

```text
https://t.me/ldvir_tool_day_bot?start=expo_landing
```

Запасний сценарій — форма на сайті, яка відправляє лід напряму в CRM через серверний API route `/api/register`. Google Sheets у резервній формі не використовується.

## Локальний запуск

```bash
npm install
npm run dev
```

Сайт відкриється на:

```text
http://localhost:3000
```

Перевірка production build:

```bash
npm run build
npm run start
```

TypeScript:

```bash
npm run typecheck
```

## Env-змінні

Скопіюйте `.env.example` у `.env.local` для локального запуску:

```bash
cp .env.example .env.local
```

Публічні змінні:

```env
NEXT_PUBLIC_SITE_URL=https://expo.ldvir.ua
NEXT_PUBLIC_TELEGRAM_BOT_URL=https://t.me/ldvir_tool_day_bot?start=expo_landing
NEXT_PUBLIC_MANAGER_PHONE=+380679979765
NEXT_PUBLIC_META_PIXEL_ID=1362943694602745
NEXT_PUBLIC_GOOGLE_MAPS_URL=
NEXT_PUBLIC_GA_ID=
```

Серверні змінні CRM:

```env
CRM_API_URL=
CRM_API_TOKEN=
CRM_SOURCE=landing_page_form
CRM_EVENT=ldvir_tools_expo_2026
```

`CRM_API_TOKEN` не має починатися з `NEXT_PUBLIC_`, бо він використовується тільки на сервері.

## Telegram CTA

Кнопка **“Зареєструватися в Telegram”** відкриває бот у новій вкладці.

URL береться з:

```env
NEXT_PUBLIC_TELEGRAM_BOT_URL
```

Якщо змінна не задана, використовується дефолт:

```text
https://t.me/ldvir_tool_day_bot?start=expo_landing
```

CTA повторюється в hero, реєстраційному блоці та фінальному CTA.

## Резервна форма

Форма знаходиться в блоці реєстрації й має поля:

- `name` — required;
- `phone` — required;
- `interest` — optional.

Телефон маскується у форматі:

```text
+38 (067) 123-45-67
```

Перед відправкою номер нормалізується до:

```text
+380671234567
```

Форма приймає тільки українські мобільні номери. Якщо номер невалідний, показується:

```text
Введіть коректний український номер телефону
```

Після успішного створення ліда в CRM користувач бачить success-повідомлення, а Meta Pixel отримує custom event `LandingFormSubmit`. Якщо CRM не налаштована або повертає помилку, показується error-повідомлення і `LandingFormSubmit` не відправляється.

## CRM API

Frontend відправляє POST тільки на локальний route:

```text
/api/register
```

Route формує payload:

```json
{
  "source": "landing_page_form",
  "event": "ldvir_tools_expo_2026",
  "status": "Зареєстрований",
  "name": "Іван",
  "phone": "+380671234567",
  "phone_display": "+38 (067) 123-45-67",
  "interest": "DeWalt, Milwaukee",
  "page_url": "https://expo.ldvir.ua",
  "utm_source": "facebook",
  "utm_medium": "paid_social",
  "utm_campaign": "ldvir_tools_expo_2026",
  "utm_content": "banner_a",
  "utm_term": "khmelnytskyi_broad",
  "fbclid": "",
  "created_at": "ISO datetime"
}
```

Логіка CRM винесена в:

```text
lib/crm.ts
```

Щоб адаптувати інтеграцію під KeyCRM або іншу CRM, змініть `createCrmLead()` і формат `crmPayload`. Коментар до ліда вже містить подію, інтерес, UTM, fbclid, сторінку та примітку **“Резервна реєстрація без Telegram.”**

## Meta Pixel і GA4

Meta Pixel використовує:

```env
NEXT_PUBLIC_META_PIXEL_ID
```

Якщо змінна не задана, використовується переданий для кампанії ID:

```text
1362943694602745
```

Події:

- `PageView` — при відкритті сторінки;
- `ViewContent` — після завантаження landing page;
- `TelegramRegistrationClick` — при кліку на Telegram CTA;
- `ManagerCallClick` — при кліку на дзвінок менеджеру;
- `LandingFormSubmit` — тільки після успішного створення ліда в CRM.

GA4 підключається тільки якщо задано:

```env
NEXT_PUBLIC_GA_ID
```

## UTM та fbclid

Сайт зчитує й зберігає:

- `utm_source`;
- `utm_medium`;
- `utm_campaign`;
- `utm_content`;
- `utm_term`;
- `fbclid`.

Дані зберігаються у `sessionStorage` і `localStorage`, а потім передаються в payload резервної форми.

Базове рекламне посилання:

```text
https://expo.ldvir.ua/?utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign=ldvir_tools_expo_2026&utm_content={{ad.name}}&utm_term={{adset.name}}
```

## Кнопка дзвінка

Кнопка **“Зателефонувати менеджеру”** використовує:

```env
NEXT_PUBLIC_MANAGER_PHONE=+380679979765
```

Якщо змінна не задана, використовується:

```text
tel:+380679979765
```

## Карта

Кнопка **“Прокласти маршрут”** використовує:

```env
NEXT_PUBLIC_GOOGLE_MAPS_URL
```

Якщо змінна порожня, використовується пошукове посилання Google Maps на LDVIR.UA, Хмельницький, вул. Вінницька 1/9.

## Assets

Файли зберігаються в `public`:

```text
public/logo-ldvir.png
public/store-front.jpg
public/og-image.jpg
public/brands/
public/partners/
```

`store-front.jpg` — фасад магазину LDVIR.UA, який використовується як фон hero-блоку. Щоб замінити hero-візуал, оновіть файл:

```text
public/store-front.jpg
```

Якщо потрібно окреме OG-зображення, замініть:

```text
public/og-image.jpg
```

Логотипи брендів і партнерів можна додати у відповідні папки. Якщо файлів немає, сторінка використовує текстові плашки.

## Деплой на Vercel

1. Імпортуйте репозиторій у Vercel.
2. Framework Preset: `Next.js`.
3. Build Command: `npm run build`.
4. Output Directory: залишити стандартним для Next.js.
5. Додайте env-змінні з `.env.example` у Vercel Project Settings.
6. Переконайтеся, що `CRM_API_TOKEN` доданий як server-only secret, без `NEXT_PUBLIC_`.
7. Задеплойте production environment.

## Домен expo.ldvir.ua

У Vercel:

1. Відкрийте Project Settings → Domains.
2. Додайте `expo.ldvir.ua`.
3. У DNS домену створіть запис, який запропонує Vercel.
4. Дочекайтеся статусу Valid Configuration.
5. Переконайтеся, що `NEXT_PUBLIC_SITE_URL=https://expo.ldvir.ua`.
