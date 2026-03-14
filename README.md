# Sharma Ice Cream Factory

Management system for an ice cream factory: vendors, products, billing, stock, and production logging. Built with Next.js and Firebase Firestore.

## Features

- **Dashboard** – Sales today, production, vendors, products, low-stock alerts, pending payments, 7-day sales chart, best-selling flavors, production trends
- **Vendors** – CRUD, search, stats (total business, paid, due)
- **Products** – CRUD, search, category filter
- **Billing** – Create bills (vendor + items + discount + payment), PDF download, WhatsApp share, print view
- **Billing History** – Filter by vendor, date, amount, status (Paid / Pending / Overdue); status is derived from amount paid
- **Stock** – Raw/finished stock items, add/deduct with notes, history per item
- **Production** – Log production by date, flavor, quantity, batch, notes

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Firebase Firestore** – database
- **Tailwind CSS 4**
- **Framer Motion**
- **jsPDF** – invoice PDFs

## Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled

## Setup

1. **Clone and install**

   ```bash
   cd sharma-ice-cream
   npm install
   ```

2. **Firebase**

   - Create a project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore and create the collections with the schema below (or let the app create docs on first use)
   - In Project settings → General → Your apps, add a Web app and copy the config

3. **Environment**

   Create `.env.local` in the project root:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The app redirects to `/dashboard`.

## Scripts

| Command       | Description                |
| ------------- | -------------------------- |
| `npm run dev` | Start dev server           |
| `npm run build` | Production build         |
| `npm run start` | Run production server    |
| `npm run lint`  | Run ESLint               |

## Firestore Schema

- **Vendor** – Doc ID e.g. `VDN-0001`. Fields: `name`, `phone`, `shop_name`, `address`, `gst_number`, `notes`, `created_at`
- **Products** – Doc ID e.g. `PRD-001`. Fields: `name`, `flavor`, `category`, `price`, `current_stock`
- **bills** – Doc ID e.g. `INV-2026-001`. Fields: `vendor_id`, `vendor_name`, `vendor_phone`, `date`, `items`, `subtotal`, `discount_percent`, `discount_amount`, `total`, `amount_paid`, `status`, `created_at`
- **production_logs** – Auto ID. Fields: `date`, `flavor`, `quantity`, `batch_number`, `notes`, `created_at`
- **stock** – Doc ID e.g. `STK-001`. Fields: `name`, `category`, `quantity`, `unit`, `min_stock`, `last_updated`
- **stock_history** – Auto ID. Fields: `stock_item_id`, `type`, `quantity`, `previous_qty`, `new_qty`, `date`, `notes`

All field names use **snake_case**. Timestamps use `serverTimestamp()` where applicable.

## Mobile

The UI is responsive:

- **Sidebar** – Drawer on small screens; open via hamburger in the header; tap backdrop or close to dismiss.
- **Tables** – Horizontal scroll when needed.
- **Layout** – Reduced padding and stacked filters on narrow viewports.

## Project Structure

```
app/(dashboard)/     # Dashboard routes (layout with sidebar + header)
  dashboard/        # Home
  vendors/          # List + [id] profile
  products/
  billing/          # Create bill + history + [id] detail + print
  stock/
  production/
components/
  layout/           # Sidebar, Header, DashboardLayout, SidebarContext
  ui/               # Card, Button, Modal, Table, DataTable, etc.
  forms/            # VendorForm, ProductForm
  providers/        # ToastProvider
lib/
  firebase.ts       # Firestore db
  firestore-converters.ts
  invoice-pdf.ts
services/           # vendors, products, bills, stock, production
utils/              # format (date/time), id generators, whatsapp
types/              # Shared TypeScript types
```

## License

Private.
