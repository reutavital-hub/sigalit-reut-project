# Bakery Order & Catalog Management System

A modern Full-Stack system for managing customer orders, product catalogs, and calendar availability for a home-based boutique bakery.  
The application allows customers to place orders online, while enabling the business manager to track order statuses, update prices, toggle product availability, block unavailable dates, and trigger automated WhatsApp customer updates.

---

## Features

### Client / Storefront
- **Rich Catalog Display:** Products organized by categories (cookies, round cakes, dessert boxes).
- **Smart Order Form:** Real-time pickup/delivery date and time selection with automatic filtering of blocked dates.
- **Tailored RTL UI:** Clean Hebrew-oriented interface styled with brand color palettes.

### Admin Dashboard
- **Secure Authentication:** Protected route access via username, password, and JWT authentication tokens.
- **Active Orders Tracking:** Real-time order monitoring with fast status toggles for payment and pickup readiness.
- **WhatsApp Integration:** Direct customer messaging for ready-for-pickup notifications and payment reminders in a single click.
- **Catalog Management (TanStack Table):** Interactive product table featuring quick search/filter, inline price editing, instant item activation/deactivation, and new product creation.
- **Date Management:** Easy blocking and unblocking of delivery dates due to full capacity or vacation.

---

## Tech Stack

### Client
- **React 18** & **Vite**
- **@tanstack/react-table** – Fast data grid, filtering, and table management
- **Lucide React** – Clean UI icons
- **CSS3** – Complete RTL support and customized CSS variables

### Server
- **Node.js** & **Express**
- **JWT (JSON Web Tokens)** & **Bcrypt** – Authentication and secure password hashing
- **CORS**, **Dotenv**, **Winston / Morgan** – Server infrastructure, environment handling, and request logging
- **Jest** & **Supertest** – Unit and API integration testing

---

## Project Structure

```text
├── client/                 # Frontend client (Vite + React)
│   ├── public/             # Static assets (product images, logo)
│   ├── src/
│   │   ├── components/     # UI components (AdminDashboard, ProductsManagement, etc.)
│   │   ├── index.css       # Global design variables and RTL styling
│   │   └── App.jsx
│   └── package.json
├── server/                 # Backend REST API (Node.js + Express)
│   ├── routes/             # API routes (orders, products, blocked dates, auth)
│   ├── index.js            # Server entry point
│   └── package.json
├── ALL_LICENSES            # Third-party open source licenses registry
└── README.md               # Project documentation

```
----

# מערכת ניהול הזמנות וקטלוג למאפייה 

מערכת Full-Stack מודרנית לניהול הזמנות, קטלוג מוצרים ויומן זמינות עבור מאפייה ביתית.  
המערכת מאפשרת ללקוחות לבצע הזמנות אונליין, ולמנהלת העסק לנהל סטטוס הזמנות, לעדכן מחירים, להשבית מוצרים, לחסום תאריכי משלוח ולשלוח עדכוני WhatsApp אוטומטיים ללקוחות.

---

## תכונות עיקריות (Features)

### צד לקוח (Client / Storefront)
* **תצוגת קטלוג עשירה:** תצוגת מוצרים בחלוקה לקטגוריות (עוגיות , עוגות עגולות, מארזים).
* **טופס הזמנה חכם:** בחירת תאריך ושעת איסוף/משלוח תוך סינון אוטומטי של תאריכים חסומים.
* **עיצוב מותאם (RTL):** ממשק עברי נקי בגווני המותג.

### לוח בקרה למנהלת (Admin Dashboard)
* **אימות מאובטח:** כניסה מוגנת באמצעות שם משתמש, סיסמה וטוקן אימות (JWT).
* **מעקב הזמנות פעילות:** ניהול סטטוס הזמנות בזמן אמת, סימון תשלום ואיסוף.
* **אינטגרציית WhatsApp:** שליחת הודעת סטטוס ואיסוף מותאמת ישירות ללקוח בלחיצת כפתור.
* **ניהול קטלוג (TanStack Table):** טבלת מוצרים עם סינון מהיר, עדכון מחירי מוצרים במקום (Inline edit), השבתה ושחזור מוצרים מהאתר והוספת מוצר חדש.
* **חסימת תאריכים:** אפשרות לסגירת ימי פעילות עקב תפוסה מלאה או חופשה.

---

## טכנולוגיות וכלים (Tech Stack)

### Client
* **React 18** & **Vite**
* **@tanstack/react-table** – ניהול וסינון טבלאות נתונים
* **Lucide React** – אימוג'ים
* **CSS3** – תמיכה מלאה ב-RTL ומשתני עיצוב מותאמים

### Server
* **Node.js** & **Express**
* **JWT (JSON Web Tokens)** & **Bcrypt** – אבטחה, אימות והצפנת סיסמאות
* **CORS**, **Dotenv**, **Winston / Morgan** – תשתית שרת, ניהול סביבה ו-Logging
* **Jest** & **Supertest** – בדיקות יחידה ואינטגרציה

---

## מבנה התיקיות (Project Structure)

```text
├── client/                 # צד הלקוח (Vite + React)
│   ├── public/             # נכסים סטטיים (תמונות מוצרים, לוגו)
│   ├── src/
│   │   ├── components/     # קומפוננטות (AdminDashboard, ProductsManagement וכו')
│   │   ├── index.css       # עיצוב גלובלי והגדרות RTL
│   │   └── App.jsx
│   └── package.json
├── server/                 # צד השרת (Node.js + Express)
│   ├── routes/             # נתיבי API (הזמנות, מוצרים, תאריכים חסומים, כניסת מנהל)
│   ├── index.js            # נקודת כניסה ראשית לשרת
│   └── package.json
├── ALL_LICENSES            # פירוט רישיונות ספריות צד שלישי (3rd Party)
└── README.md               # תיעוד הפרויקט