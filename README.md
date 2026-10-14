# QuickBite — Food Delivery Order Management System

A full-stack Food Delivery Order Management application built with **React**, **Vite**, **TypeScript**, **Node.js**, and **Express**.

The project is designed following **MVC architecture**, **SOLID design principles**, **Strict TDD (Test-Driven Development)**, and includes real-time tracking via **Server-Sent Events (SSE)**.

---

## ⚠️ Important Storage Notice: In-Memory Volatility

> **Note on Persistence:**
> This application uses **in-memory storage** (`InMemoryMenuRepository` and `InMemoryOrderRepository`).
> All menu items, cart orders, and status histories reside strictly within process volatile RAM.
> **All data is lost whenever the backend server restarts.** No data is permanently saved to an external database or disk.

---

## Architecture & SOLID Principles

### Backend Architecture (MVC)
```
backend/src/
├── models/             # Domain entities (MenuItem, Order, OrderStatus, Snapshots)
├── repositories/       # Data access abstractions (IMenuRepository, IOrderRepository)
│                       # and implementations (InMemoryMenuRepository, InMemoryOrderRepository)
├── services/           # Core business logic (MenuService, OrderService)
├── controllers/        # HTTP handlers & response formatting (MenuController, OrderController)
├── routes/             # Route definitions & router factories (menuRoutes, orderRoutes)
├── app.ts              # Express application factory with Dependency Injection
└── index.ts            # Server entrypoint
```

- **Single Responsibility Principle (SRP):**
  - Controllers only parse HTTP requests and format responses.
  - Services execute business rules, runtime validations, and price calculations.
  - Repositories encapsulate data access.
- **Open/Closed Principle (OCP):**
  - Services depend on interfaces (`IMenuRepository`, `IOrderRepository`), enabling replacement or extension with persistent storage without modifying domain logic.
- **Liskov Substitution Principle (LSP):**
  - Concrete repositories strictly fulfill all interface contracts.
- **Interface Segregation Principle (ISP):**
  - Focused, cohesive interfaces for menu access and order lifecycle management.
- **Dependency Inversion Principle (DIP):**
  - High-level business services (`MenuService`, `OrderService`) depend on abstractions (`IMenuRepository`, `IOrderRepository`), injected via constructors.

---

## Features

### 1. Menu Browsing
- Browse available dishes with images, names, descriptions, prices, and categories.
- Real-time search query filtering and category chip selector.
- Retrieved via `GET /api/menu` and `GET /api/menu/:id`.

### 2. Cart Management
- Add items to cart with live item counter badge.
- Increment, decrement, or remove items directly.
- Real-time client-side subtotal and total calculations.
- Clear cart action.

### 3. Checkout
- Captures Customer Name (min 2 characters), Delivery Address (min 5 characters), and valid Phone Number.
- Validates data both on frontend form and with strict runtime validation on the backend.
- Creates order via `POST /api/orders`.
- **Trusted Backend Pricing:** Backend recalculates and enforces prices from the catalog; client-submitted prices are ignored.

### 4. Order Management & Business Rules
- Allowed Order Status State Machine:
  - `PENDING` ➔ `CONFIRMED` or `CANCELLED`
  - `CONFIRMED` ➔ `PREPARING` or `CANCELLED`
  - `PREPARING` ➔ `OUT_FOR_DELIVERY` or `CANCELLED`
  - `OUT_FOR_DELIVERY` ➔ `DELIVERED`
  - `DELIVERED` / `CANCELLED` (Terminal states)
- Cancellation / Deletion via `DELETE /api/orders/:id` (only permitted before dispatch).

### 5. Real-Time Tracking & Simulation
- **Server-Sent Events (SSE):** `GET /api/orders/:id/tracking` streams instant status updates to the client.
- **Visual Order Timeline:** Interactive status stepper highlighting the current fulfillment stage.
- **Status Simulation Controls:**
  - `POST /api/orders/:id/simulate` with `{ stepOnly: true }` to advance one step.
  - `POST /api/orders/:id/simulate` with `{ auto: true }` to automatically transition through all stages every 2.5s until `DELIVERED`.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Strict Mode, Custom CSS |
| **Backend** | Node.js, Express, TypeScript, CORS |
| **Testing** | Vitest, React Testing Library, Supertest, jsdom |
| **Storage** | Dedicated In-Memory Maps |

---

## Getting Started

### 1. Install Dependencies
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### 2. Run Tests (Strict TDD Suite)
Run all backend and frontend tests from root:
```bash
npm test
```
Or individually:
```bash
npm run test:backend   # 39 passing tests (Unit + Supertest integration + SSE)
npm run test:frontend  # 24 passing tests (Unit + React Testing Library)
```

### 3. Start Development Servers
**Terminal 1 (Backend API):**
```bash
npm run dev:backend
# Starts Express API server on http://localhost:3000
```

**Terminal 2 (Frontend UI):**
```bash
npm run dev:frontend
# Starts Vite React UI on http://localhost:5000 (proxies /api to :3000)
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/menu` | List all menu items |
| `GET` | `/api/menu/:id` | Get menu item by ID |
| `GET` | `/api/orders` | List all orders |
| `POST` | `/api/orders` | Create an order |
| `GET` | `/api/orders/:id` | Get single order by ID |
| `PATCH` | `/api/orders/:id/status` | Update order status with transition rules |
| `DELETE` | `/api/orders/:id` | Cancel/delete order |
| `POST` | `/api/orders/:id/simulate` | Simulate status advancement |
| `GET` | `/api/orders/:id/tracking` | SSE stream for real-time order tracking |
