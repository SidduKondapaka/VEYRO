# 🛍️ VEYRO — Full-Stack E-Commerce Marketplace

> **A modern, responsive e-commerce web application inspired by Amazon, engineered with Spring Boot 3, Java 21, MySQL, and React 18.**

---

## 📌 Project Overview

**VEYRO** is a production-grade full-stack e-commerce marketplace built as a technical training capstone project. Designed with enterprise-grade modular architecture, VEYRO provides complete end-to-end shopping and marketplace administration capabilities.

### 🌟 Key Highlights
- **Architecture**: 3-tier decoupling (React SPA + Spring Boot REST APIs + MySQL RDBMS).
- **Security**: Stateless JWT authentication with BCrypt hashing, role-based access control (`ROLE_CUSTOMER`, `ROLE_ADMIN`).
- **Interactive UI**: Custom dark slate & emerald theme, micro-interactions, responsive mobile-friendly layouts, no generic placeholders.
- **Data Persistence**: 15 relational tables with JPA cascade rules, transactional stock decrement, and foreign key integrity.
- **Zero Mocking**: 100% of data is retrieved dynamically via REST endpoints from the database.

---

## 🚀 Live Running Services

| Service | Port / URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Vite + React 18 E-Commerce SPA |
| **Backend REST API** | [http://localhost:8080](http://localhost:8080) | Spring Boot 3.3.4 Application |
| **Swagger UI Docs** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Interactive OpenAPI 3.0 Documentation |
| **OpenAPI Specification** | [http://localhost:8080/api-docs](http://localhost:8080/api-docs) | Raw JSON API Schema |
| **MySQL Database** | `localhost:3306` (`veyro_db`) | Relational persistence storage |

---

## 🔑 Demo Login Credentials

The application auto-seeds sample accounts on startup. You can also click the **"Demo Customer"** or **"Demo Admin"** instant-fill buttons on the login page!

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@veyro.com` | `Admin@123456!` | Full admin dashboard, product catalog management, category creation, order status processing, review moderation. |
| **Customer** | `customer@veyro.com` | `Customer@123456!` | Browsing, search & filtering, persistent cart, checkout (COD & Card/UPI), order history, wishlist, verified product reviews. |

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with **Vite** build tooling
- **React Router DOM 6.28** for client-side routing & route guards
- **Axios** with global request/response interceptors for JWT injection and 401 handling
- **Lucide React** for modern UI iconography
- **Vanilla CSS3** with design tokens, glassmorphism, responsive CSS grid, and keyframe animations

### Backend
- **Java 21 (LTS)** & **Spring Boot 3.3.4**
- **Spring Security 6** with Stateless JWT Authentication (`io.jsonwebtoken:jjwt:0.12.6`)
- **Spring Data JPA & Hibernate 6.5**
- **HikariCP** Connection Pooling
- **SpringDoc OpenAPI 2.6.0** (Swagger UI)
- **Jakarta Validation** (`@Valid`, `@NotBlank`, `@Min`, `@Email`)

### Database
- **MySQL 8.0+**
- InnoDB storage engine with UTF8MB4 charset
- Auto-seeding database initializer (`DataInitializer.java`)

---

## 📂 Project Structure

```text
VEYRO/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/veyro/
│   │   │   │   ├── config/          # Security, CORS, Swagger configs
│   │   │   │   ├── controller/      # 10 REST Controllers
│   │   │   │   ├── dto/             # 31 Request/Response DTOs
│   │   │   │   ├── entity/          # 15 JPA Entity models
│   │   │   │   ├── exception/       # Global exception handler & custom exceptions
│   │   │   │   ├── repository/     # 15 Spring Data JPA repositories
│   │   │   │   ├── security/        # JWT Filter, Token Provider, UserPrincipal
│   │   │   │   ├── service/         # Business logic layer
│   │   │   │   └── VeyroApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── data-seed.sql
│   │   └── test/                    # Integration and unit test suite
│   └── pom.xml
├── database/
│   └── schema.sql                   # Raw MySQL schema definitions & sample seed
├── docs/
│   ├── ARCHITECTURE.md              # Architectural deep dive & diagrams
│   └── VIVA_PREPARATION_GUIDE.md    # Viva questions, answers, and demo script
├── frontend/
│   ├── src/
│   │   ├── api/                     # Axios instance & interceptors
│   │   ├── components/              # Navbar, Footer, ProductCard, Modals, etc.
│   │   ├── context/                 # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── pages/                   # 20 View Pages (Catalog, Checkout, Admin, etc.)
│   │   ├── styles/                  # Design tokens, variables, responsive styling
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚡ Quick Start & Setup Guide

### Prerequisites
- **Java 21** (`java -version`)
- **Maven 3.8+** (`mvn -v`)
- **Node.js 18+** & **npm** (`node -v`)
- **MySQL 8.0+** running on port `3306`

### 1. Database Setup
```bash
# Connect to MySQL and create the database
mysql -u root -p
CREATE DATABASE veyro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'veyro'@'localhost' IDENTIFIED BY 'Veyro@2026!';
GRANT ALL PRIVILEGES ON veyro_db.* TO 'veyro'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Backend Setup & Run
```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```
*The backend will automatically start on `http://localhost:8080` and seed all default categories, products, images, and user accounts.*

### 3. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 🧪 Testing

Run backend automated test suite:
```bash
cd backend
mvn test
```
Tests include integration tests for Authentication, Order processing with inventory deduction, Product service, and Spring context boot.

---

## 📚 Viva & Presentation Reference

For detailed project viva questions, entity relationship diagrams, and oral defense walkthroughs, please check:
- [Architecture Guide](file:///Users/sidhivinayak/VEYRO/docs/ARCHITECTURE.md)
- [Viva Preparation & Demo Script](file:///Users/sidhivinayak/VEYRO/docs/VIVA_PREPARATION_GUIDE.md)

---

## 📄 License
Academic Project for Technical Training Evaluation. © 2026 VEYRO Team.
