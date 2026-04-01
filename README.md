# FarmLink - Backend API

## Project Overview
A backend system connecting farmers with businesses, allowing product management, ordering, and payment tracking.

---

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv

---

## Project Structure
```
project fainl/
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── farmlink/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productcontroller.js
│   │   └── orderController.js
│   ├── middlewares/
│   │   └── auth.js
│   └── routes/
│       ├── authRoutes.js
│       ├── productRoutes.js
│       └── orderRoutes.js
├── server.js
└── .env
```

---

## Database Models

### User Model
| Field    | Type    | Description                             |
|----------|---------|-----------------------------------------|
| name     | String  | User full name                          |
| email    | String  | Unique email                            |
| password | String  | Hashed password                         |
| role     | String  | admin / farmer / business               |
| approved | Boolean | Farmer approval status (default: false) |

### Product Model
| Field         | Type    | Description                  |
|---------------|---------|------------------------------|
| farmer        | Ref     | Reference to User (farmer)   |
| name          | String  | Product name                 |
| category      | String  | Product category             |
| price         | Number  | Product price                |
| stockQuantity | Number  | Available stock              |
| image         | String  | Product image URL            |
| isAvailable   | Boolean | Availability (default: true) |

### Order Model
| Field         | Type   | Description                                           |
|---------------|--------|-------------------------------------------------------|
| business      | Ref    | Reference to User (business)                          |
| farmer        | Ref    | Reference to User (farmer)                            |
| products      | Array  | Array of { product, quantity, price }                 |
| totalAmount   | Number | Total order amount                                    |
| paymentMethod | String | online / cash                                         |
| status        | String | pending / confirmed / shipped / delivered / cancelled |
| commission    | Number | Platform commission (10% of totalAmount)              |
| farmerAmount  | Number | Amount farmer receives (totalAmount - commission)     |
| paymentStatus | String | pending / paid                                        |

---

## API Endpoints

### Authentication
| Method | Endpoint                  | Access | Description            |
|--------|---------------------------|--------|------------------------|
| POST   | /api/auth/register        | Public | Register new user      |
| POST   | /api/auth/login           | Public | Login and get token    |
| GET    | /api/auth/pending-farmers | Admin  | Get unapproved farmers |
| PATCH  | /api/auth/:id/approve     | Admin  | Approve a farmer       |

### Products
| Method | Endpoint                | Access | Description                        |
|--------|-------------------------|--------|------------------------------------|
| POST   | /api/products           | Farmer | Add new product                    |
| GET    | /api/products/available | Public | Get available products with filter |

#### Filtering Products
```
GET /api/products/available?category=fruits&minPrice=10&maxPrice=100
```

### Orders
| Method | Endpoint               | Access   | Description         |
|--------|------------------------|----------|---------------------|
| POST   | /api/orders            | Business | Create new order    |
| GET    | /api/orders/my-orders  | Business | Get my orders       |
| PATCH  | /api/orders/:id/status | Any      | Update order status |
| PATCH  | /api/orders/:id/pay    | Business | Confirm payment     |

---

## Authentication & Authorization
- JWT token is required for protected routes
- Send token in header: `Authorization: Bearer <token>`
- Roles:
  - **admin**: Can approve farmers
  - **farmer**: Can add products (must be approved)
  - **business**: Can create and track orders

---

## Commission Logic
- Platform takes **10%** commission on every order
- Example: totalAmount = 1000 → commission = 100 → farmerAmount = 900
- Calculated automatically when order is created

---

## Week 1 - Completed ✅
- ✅ Project setup (Express + MongoDB)
- ✅ MongoDB connection
- ✅ User & Product & Order Models
- ✅ Authentication (Register / Login)
- ✅ View available products
- ✅ Order quantities
- ✅ Payment method (online / cash)
- ✅ Track order status

## Week 2 - Completed ✅
- ✅ Add products (farmer only)
- ✅ View all available products
- ✅ Filter by category and price
- ✅ Admin approval for farmers

## Week 3 - Completed ✅
- ✅ Orders (create, view, update status)
- ✅ Stock logic (auto deduct stock on order)
- ✅ Payment logic (online / cash + payment status)
- ✅ Commission calculation (10% platform fee)

## Week 4 - Completed ✅
- ✅ Validation (name, email, password, price, quantity)
- ✅ Global error handling middleware
- ✅ Security (helmet, cors, rate-limit)
- ✅ Postman Collection (FarmLink.postman_collection.json)
