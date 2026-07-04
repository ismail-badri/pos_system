# EL HAMDI Store Management System

A full-stack Point of Sale (POS) and inventory management platform: barcode scanning, live cart, invoicing, inventory tracking, customer management, and sales reporting.

**Stack:** React + Tailwind (frontend) · Node.js + Express (backend) · MySQL (database) · JWT auth

---

## 1. Project Structure

```
el-hamdi-store/
├── backend/
│   ├── config/db.js            # MySQL connection pool
│   ├── controllers/            # Business logic per resource
│   ├── middleware/              # JWT auth + role-based access control
│   ├── routes/                  # Express route definitions
│   ├── database/
│   │   ├── schema.sql           # Full DB schema
│   │   └── seed.js              # Creates default admin + categories
│   ├── server.js                # App entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js          # API client with auto JWT header
    │   ├── context/AuthContext.jsx
    │   ├── components/           # Sidebar, Layout, ProtectedRoute
    │   └── pages/                # Login, Dashboard, POS, Products, Customers, SalesHistory, Reports
    ├── tailwind.config.js        # Design tokens (colors, fonts)
    └── vite.config.js
```

---

## 2. Prerequisites

- Node.js 18+
- MySQL 8+ (or MariaDB 10.5+)
- A USB barcode scanner (works as a keyboard, or type barcodes manually) — a mobile-camera scanner can be added later by wiring a JS barcode-reading library into the POS input

---

## 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL credentials and a strong JWT_SECRET
```

Create the database schema:

```bash
mysql -u root -p < database/schema.sql
```

Seed a default administrator account and starter categories:

```bash
npm run seed
```

This creates:
- **username:** `admin`
- **password:** `admin123` (change this immediately after first login)

Start the API server:

```bash
npm run dev      # with auto-reload (nodemon)
# or
npm start
```

The API runs on `http://localhost:5000` by default. Check it's alive at `GET /api/health`.

---

## 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`. It talks to the API at `http://localhost:5000/api` by default — override with a `.env` file containing `VITE_API_URL=http://your-api-host/api` if needed.

---

## 5. Using the System

1. **Log in** with the seeded admin account (or an employee account you create).
2. **Products** — add your catalog: barcode, name, price, cost, starting stock, low-stock threshold.
3. **Point of Sale** — scan or type a barcode and press Enter to add it to the cart. Adjust quantities, apply a discount, choose a payment method, then **Complete Sale**. Stock decrements automatically and an invoice number is generated.
4. **Customers** — save repeat customers to track their purchase history and loyalty points (1 point per 10 currency units spent).
5. **Sales History** — search past invoices by invoice number; click a row to view the full receipt.
6. **Dashboard** — today's revenue/orders, low-stock alerts, best sellers, recent transactions, and a 6-month revenue trend.
7. **Reports** (admin only) — sales by day/week/month/year, profit per product, low-stock report, and customer spend report.

---

## 6. Roles

| Capability | Admin | Employee |
|---|---|---|
| Login, scan, checkout | ✅ | ✅ |
| View products/customers/sales | ✅ | ✅ |
| Add/edit/delete products | ✅ | ❌ |
| Add customers | ✅ | ✅ |
| Delete customers | ✅ | ❌ |
| View Reports & Analytics | ✅ | ❌ |

Create additional users directly in the `users` table (hash passwords with bcrypt, see `database/seed.js` for an example) — an admin-only "manage employees" screen is a natural next feature to add.

---

## 7. Camera Barcode Scanning

The POS screen has a **Camera** button next to the manual barcode field. It opens the device camera and decodes barcodes (EAN-13, Code128, QR, etc.) in real time using `@zxing/browser` — no native app or extra hardware required.

**Important — browsers only allow camera access over a secure context:**
- Works automatically on `http://localhost` during development.
- On a real phone, the site must be served over **HTTPS** (or wrapped as a native app — see section 8) or the browser will silently block camera access.
- The first time it's used, the browser will ask the employee to grant camera permission.
- It automatically prefers the phone's back/rear camera when available.

Install the new dependency before running the frontend:

```bash
cd frontend
npm install
```

## 8. Installing as an App (PWA) — No Android Studio Needed

The frontend is already configured as an installable Progressive Web App: a manifest, custom app icon, and a service worker are included, plus an in-app "Install" banner.

**To make it installable on real phones, the site must be deployed over HTTPS** (browsers block installability and camera access on plain HTTP, except on `localhost`). Any of these work well for a small business:

- **Vercel** or **Netlify** (free tier): connect the `frontend/` folder, set `VITE_API_URL` to your backend's public URL as an environment variable, deploy.
- Any VPS with a free HTTPS certificate (e.g. via Certbot/Let's Encrypt) behind Nginx.

Once deployed:
1. Open the site in Chrome on the employee's Android phone.
2. A small "Install EL HAMDI Store on this device" banner appears — tap **Install** (or use Chrome's menu → *Add to Home screen*).
3. It appears on the home screen with its own icon and opens full-screen, no browser bar — indistinguishable from a native app for day-to-day use, and the camera scanner works the same as in the browser.

This does **not** produce a `.apk` file or a Play Store listing — for that, use the Capacitor path below.

## 9. Turning This Into an Android APK

The recommended approach is **Capacitor** — it wraps this exact React app in a native Android shell and gives it real camera/filesystem access, producing a genuine installable `.apk`. High-level steps (run from the `frontend/` folder):

```bash
npm install @capacitor/core @capacitor/android
npx cap init "EL HAMDI Store" "com.elhamdi.store"
npm run build              # builds the production web app into frontend/dist
npx cap add android
npx cap copy
npx cap open android       # opens Android Studio
```

Then in Android Studio: `Build → Build Bundle(s)/APK(s) → Build APK(s)`. Notes:
- Add the camera permission in `android/app/src/main/AndroidManifest.xml`: `<uses-permission android:name="android.permission.CAMERA" />` (Capacitor usually adds it automatically once it detects camera usage, but confirm it's there).
- Point `VITE_API_URL` at your deployed backend's real address (not `localhost`) before running `npm run build` — the APK won't have access to your dev machine's localhost.
- Requires Android Studio installed locally to complete the build.

## 10. What's Included vs. What's Next

**Included in this scaffold:**
- JWT authentication with role-based access control
- Barcode-driven POS with live cart and atomic stock deduction (DB transaction — no overselling, even with concurrent checkouts)
- **Camera barcode scanning** — click "Camera" on the POS screen to scan with a phone or laptop camera instead of a USB scanner (see section 7)
- **Installable PWA** — manifest, app icon, service worker, and an in-app install prompt, so it can be added to an Android home screen with no build step (see section 8)
- Full CRUD for products and customers
- Dashboard with live stats and a 6-month revenue chart
- Sales history with searchable invoices and receipt detail view
- Reports: sales by period, profit by product, low stock, customer spend
- Complete MySQL schema matching the original spec, plus an `inventory_movements` audit table and a `categories` table

**Natural next steps** (mentioned as "Future Improvements" in the original spec):
- PDF invoice export and email delivery (schema and invoice numbering are already in place — wire in `pdfkit`, already listed as a backend dependency)
- Mobile-camera barcode scanning (e.g. `@zxing/browser`) as an alternative to a USB scanner
- Product image upload (an `image` column already exists on `products`; add `multer` upload handling — already listed as a dependency)
- Employee management screen for admins
- Multi-store support, online payments, SMS notifications
# store-system
# el-hamdi-store
# el-hamdi-store
# el-hamdi-store
# el-hamdi-store
# pos_system
