# 🎓 VEYRO — Technical Viva & Project Defense Guide

This guide is designed to prepare you to present and defend the **VEYRO** Full-Stack E-Commerce Marketplace project before evaluators, technical trainers, and viva examiners.

---

## 1. Project Elevator Pitch (30-Second Introduction)

> *"Good morning, examiners. My project is **VEYRO**, a full-stack, Amazon-inspired enterprise e-commerce marketplace built using **Spring Boot 3, Java 21, MySQL, and React 18**. It solves the challenge of end-to-end multi-category online retail with stateless JWT authentication, role-based authorization for customers and administrators, transactional stock management, persisted shopping carts and wishlists, and real-time order lifecycle tracking. Everything runs on clean RESTful architecture backed by a normalized 15-table relational database with zero mocked frontend data."*

---

## 2. Core Viva Questions & Technical Answers

### Q1: Why did you choose a decoupled React + Spring Boot architecture over a monolithic MVC (Thymeleaf / JSP)?
**Answer:**
- **Separation of Concerns:** The backend acts strictly as an API service returning structured JSON, allowing independent scaling, easier unit testing, and the ability to support future mobile clients (Android/iOS) using the exact same APIs.
- **Modern User Experience:** React creates a responsive Single-Page Application (SPA) where route transitions, cart additions, and filter applications happen without jarring full-page browser reloads.
- **Enterprise Standard:** Industry enterprise standards decouple frontend presentation tiers from business services.

---

### Q2: How does authentication and authorization work in VEYRO?
**Answer:**
- We implemented **Stateless JWT (JSON Web Token)** authentication using Spring Security 6 and JJWT 0.12.x.
- Passwords are never stored in plaintext; they are hashed with `BCryptPasswordEncoder` (salted work factor 10).
- When a user logs in via `/api/auth/login`, Spring generates a signed HMAC-SHA256 token containing the user identity and granted authorities (`ROLE_CUSTOMER`, `ROLE_ADMIN`).
- On every subsequent request, our custom `JwtAuthenticationFilter` intercepts the HTTP header `Authorization: Bearer <token>`, validates the cryptographic signature, extracts the user principal, and sets it in the `SecurityContextHolder`.
- Method and endpoint security (`@PreAuthorize` / `requestMatchers`) enforce role checks.

---

### Q3: How do you prevent overselling or race conditions during checkout?
**Answer:**
- Checkout logic in `OrderServiceImpl.createOrder()` is wrapped in `@Transactional(isolation = Isolation.READ_COMMITTED)`.
- Before an order is finalized, each line item's required quantity is checked against the database:
  ```java
  if (product.getStockQuantity() < item.getQuantity()) {
      throw new InsufficientStockException("Insufficient stock for: " + product.getTitle());
  }
  product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
  ```
- Because this occurs within an active database transaction, if any product fails stock verification, the entire transaction rolls back, preventing partial order placement and stock corruption.
- If an order is later cancelled, the stock is automatically restored to the inventory pool.

---

### Q4: Explain your database schema design. How did you normalize it?
**Answer:**
- The schema is normalized up to **Third Normal Form (3NF)** across 15 relational tables:
  1. **User domain**: `users`, `roles`, `user_roles`, `addresses`, `password_reset_tokens`.
  2. **Product domain**: `categories` (with self-referencing `parent_id` for subcategories), `products`, `product_images`.
  3. **Customer engagement**: `carts`, `cart_items`, `wishlists`, `wishlist_items`, `reviews`.
  4. **Order processing**: `orders`, `order_items` (which freezes the snapshot price at purchase time to protect against future price changes), and `order_status_history` (audit trail).
- We applied foreign key constraints with `ON DELETE CASCADE` where appropriate (e.g. cart items deleted when cart is emptied).
- Indexes are added on frequently queried columns: `products.slug`, `products.category_id`, `orders.user_id`, and `categories.slug`.

---

### Q5: How is client-state managed in the React frontend?
**Answer:**
- We utilize React's **Context API** for global domain state:
  - `AuthContext`: Manages current user session, JWT decoding, and login/logout state.
  - `CartContext`: Manages server-synced cart items, badge counters, and real-time subtotals.
  - `WishlistContext`: Manages saved items and instant toggle states.
  - `ToastContext`: Dispatches global non-blocking success/error toast alerts.
- API communication is handled through an Axios instance equipped with request interceptors (to inject the `Bearer` token) and response interceptors (to handle 401 expiration gracefully).

---

### Q6: What happens if an API call fails or throws an exception in the backend?
**Answer:**
- We implemented a centralized `@RestControllerAdvice` called `GlobalExceptionHandler`.
- It catches specific domain exceptions (`ResourceNotFoundException`, `InsufficientStockException`, `BadRequestException`, `BadCredentialsException`) as well as Spring's `MethodArgumentNotValidException`.
- It serializes them into a consistent, predictable `ErrorResponse` JSON with HTTP status codes, error details, and UTC timestamps.

---

## 3. Step-by-Step Live Demonstration Script for Reviewers

When presenting your screen:

1. **Start on Home Page (`http://localhost:5173`)**:
   - Point out the branding, hero banner carousel, category cards, and featured/trending products.
   - Show that all products display original images, star ratings, and real badge indicators.

2. **Demonstrate Product Discovery**:
   - Click **"Browse Catalog"** or a Category card.
   - Use the **Search bar** to search for *"Headphones"* or *"Watch"*.
   - Filter by **Category**, **Price range slider**, and **In Stock Only**.
   - Sort by **"Price: Low to High"** and **"Customer Rating"**.

3. **Demonstrate Authentication**:
   - Go to **Login** page.
   - Click the convenient **"Demo Customer"** quick-fill button (`customer@veyro.com`).
   - Click **Login**; observe the instant transition and personalized navigation header.

4. **Demonstrate Shopping Cart & Wishlist**:
   - Add a product to the **Wishlist** (heart icon). Open the Wishlist page to confirm.
   - Add an item to the **Cart** with custom quantity.
   - Open the **Cart** page; update quantity and observe real-time recalculation of subtotal, tax, and total.

5. **Demonstrate Complete Checkout Flow**:
   - Click **"Proceed to Checkout"**.
   - Select or add a shipping address.
   - Select payment method (**"Cash on Delivery"** or **"Demo Card / UPI"**).
   - Click **"Place Order"**.
   - Show the generated **Order Confirmation** screen with the generated Order Number.

6. **Demonstrate Order History & Lifecycle**:
   - Navigate to **"My Orders"**.
   - Open the order details page to show the timeline status history and price breakdown.

7. **Demonstrate Admin Portal**:
   - Log out, then log in using the **"Demo Admin"** button (`admin@veyro.com`).
   - Notice the **"Admin Dashboard"** button in the navbar.
   - Navigate to `/admin`:
     - **Dashboard**: Show KPI metric cards (Total Sales, Total Orders, Products, Users).
     - **Products**: Show catalog table, search, stock levels, and the **"Add Product"** modal.
     - **Orders**: Change order status (e.g. from `CONFIRMED` to `SHIPPED` or `DELIVERED`).
     - **Reviews**: View customer reviews and ratings.

8. **Show Backend Architecture & Swagger**:
   - Open [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).
   - Show the OpenAPI documentation with 10 REST controllers and interactive endpoint testing.

---

## 4. Key Strengths to Highlight During Viva
1. **Zero Mocking:** No hardcoded arrays in the frontend; all state flows from MySQL via Spring Boot.
2. **Robust Validation:** Jakarta `@Valid` annotations on backend DTOs + frontend form validation.
3. **Enterprise Transaction Handling:** Inventory decrement and rollback logic tested with automated JUnit tests.
4. **Professional UI:** High visual polish, accessible contrast, responsive breakpoints, and consistent theme.
