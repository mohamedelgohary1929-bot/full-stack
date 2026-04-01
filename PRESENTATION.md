# FarmLink - Full Project Presentation

---

## Slide 1 - What is FarmLink?

FarmLink is a **backend API system** that connects farmers with businesses.

### The Problem:
- Farmers have products but no easy way to sell them
- Businesses need fresh products but no direct connection to farmers
- No system to manage orders, payments, or track deliveries

### The Solution:
- A platform where farmers list their products
- Businesses browse, order, and pay online or on delivery
- Admin controls who can sell on the platform

---

## Slide 2 - Why These Technologies?

### Node.js
- Fast and lightweight
- Perfect for building APIs
- Large community and support

### Express.js
- Built on top of Node.js
- Makes building routes and APIs very easy
- Minimal and flexible

### MongoDB
- Stores data as JSON-like documents
- Perfect for flexible data like products and orders
- Easy to scale

### Mongoose
- Helps us define the shape of our data (Schema)
- Validates data before saving to MongoDB
- Makes querying the database easier

### JWT (JSON Web Token)
- Used for authentication
- When a user logs in, they get a token
- They send this token with every request to prove who they are
- No need to store sessions on the server

### bcryptjs
- Passwords are never stored as plain text
- bcryptjs hashes the password before saving
- Even if the database is hacked, passwords are safe

### express-validator
- Validates user inputs before they reach the database
- Prevents bad data like empty names or invalid emails

### helmet
- Automatically sets secure HTTP headers
- Protects against common web attacks

### cors
- Controls which domains can access the API
- Prevents unauthorized access from unknown sources

### express-rate-limit
- Limits how many requests a user can make
- Protects against spam and brute force attacks

---

## Slide 3 - System Architecture

```
Client (Postman / Frontend)
        ↓
    server.js  ← Entry point
        ↓
    Routes  ← Decides which controller to call
        ↓
  Middleware  ← Checks token, role, validation
        ↓
  Controllers  ← Business logic
        ↓
    Models  ← Talks to MongoDB
        ↓
    MongoDB  ← Stores data
```

---

## Slide 4 - Database Design

### Why 3 Models?
We have 3 types of data that need to be stored separately.

---

### User Model
```
name, email, password, role, approved
```
| Field | Why |
|-------|-----|
| name | To identify the user |
| email | Unique identifier for login |
| password | Hashed with bcryptjs for security |
| role | Controls what the user can do (admin/farmer/business) |
| approved | Farmers need admin approval before they can sell |

---

### Product Model
```
farmer, name, category, price, stockQuantity, image, isAvailable
```
| Field | Why |
|-------|-----|
| farmer | Links the product to the farmer who owns it |
| name | Product name |
| category | Allows filtering by type (vegetables, fruits, etc.) |
| price | Price per unit |
| stockQuantity | Tracks how much is available |
| image | Product photo URL |
| isAvailable | Quickly hide/show products without deleting them |

---

### Order Model
```
business, farmer, products, totalAmount, paymentMethod, status, commission, farmerAmount, paymentStatus
```
| Field | Why |
|-------|-----|
| business | Who placed the order |
| farmer | Who will fulfill the order |
| products | Array of items ordered with quantity and price |
| totalAmount | Total cost of the order |
| paymentMethod | online or cash |
| status | Tracks where the order is (pending → delivered) |
| commission | Platform takes 10% from every order |
| farmerAmount | What the farmer actually receives |
| paymentStatus | Whether the payment was made or not |

---

## Slide 5 - Authentication System

### How it works:
1. User registers with name, email, password, role
2. Password is hashed with bcryptjs before saving
3. User logs in with email and password
4. Server checks password with bcryptjs
5. If correct, server generates a JWT token
6. User sends this token in every request header:
```
Authorization: Bearer <token>
```

### Why JWT?
- No need to store sessions on the server
- Token contains user id and role
- Token expires after 7 days for security

### Roles:
| Role | What they can do |
|------|-----------------|
| admin | Approve farmers |
| farmer | Add products (must be approved first) |
| business | Create orders and pay |

---

## Slide 6 - Farmer Approval System

### Why do we need approval?
- Not everyone should be able to sell on the platform
- Admin verifies the farmer is real before they can list products
- Protects businesses from fake sellers

### How it works:
1. Farmer registers with role = "farmer"
2. approved = false by default
3. Admin sees list of pending farmers
4. Admin approves the farmer
5. Now farmer can add products

```
GET  /api/auth/pending-farmers  → Admin sees unapproved farmers
PATCH /api/auth/:id/approve     → Admin approves a farmer
```

---

## Slide 7 - Product Management

### Adding a Product (Farmer only)
- Only approved farmers can add products
- Farmer ID comes from the JWT token (not from the request body)
- This prevents a farmer from adding products under another farmer's name

### Viewing Products (Public)
- Anyone can view available products
- Products with isAvailable = true are shown

### Filtering Products
- Filter by category: `?category=vegetables`
- Filter by min price: `?minPrice=10`
- Filter by max price: `?maxPrice=100`
- Can combine all filters together

```
GET /api/products/available?category=fruits&minPrice=10&maxPrice=100
```

---

## Slide 8 - Order Flow

### Step by step:
1. Business browses available products
2. Business creates an order with products and quantities
3. System checks if stock is available
4. System calculates total amount
5. System calculates commission (10%)
6. System calculates farmer amount (total - commission)
7. Stock is automatically deducted
8. Order is saved with status = "pending"

### Commission Logic:
| Example | Value |
|---------|-------|
| Total Amount | 1000 EGP |
| Commission (10%) | 100 EGP |
| Farmer Receives | 900 EGP |

### Why commission?
- The platform needs revenue to operate
- 10% is taken automatically on every order
- Farmer always knows exactly what they will receive

---

## Slide 9 - Payment System

### Two payment methods:
| Method | How it works |
|--------|-------------|
| cash | Payment on delivery, no online action needed |
| online | Business confirms payment through the API |

### Payment Status:
- Starts as "pending" for all orders
- Business calls `/api/orders/:id/pay` to confirm online payment
- Cash orders cannot use this endpoint

### Order Status Flow:
```
pending → confirmed → shipped → delivered
                              ↘ cancelled
```

---

## Slide 10 - Validation

### Why validation?
- Prevents bad data from entering the database
- Gives clear error messages to the user
- Protects the system from crashes

### What we validate:
| Endpoint | What is validated |
|----------|------------------|
| Register | name not empty, valid email, password min 6 chars, valid role |
| Login | valid email, password not empty |
| Add Product | name, category not empty, price and stock are positive numbers |
| Create Order | farmer required, products array not empty, valid payment method |

### Example error response:
```json
{
  "errors": [
    { "msg": "Valid email is required", "path": "email" },
    { "msg": "Password must be at least 6 characters", "path": "password" }
  ]
}
```

---

## Slide 11 - Security

### helmet
- Sets secure HTTP headers automatically
- Protects against attacks like clickjacking and XSS

### cors
- Controls which domains can call the API
- Prevents unauthorized websites from using the API

### rate-limit
- Maximum 100 requests per 15 minutes per user
- Protects against brute force attacks and spam

### Password Hashing
- Passwords are never stored as plain text
- bcryptjs hashes with salt rounds = 10
- Even database admins cannot see real passwords

### JWT Expiry
- Tokens expire after 7 days
- User must login again after expiry

---

## Slide 12 - Error Handling

### Why global error handling?
- Without it, every controller needs its own error handling
- One central place handles all errors
- Consistent error responses across the whole API

### How it works:
- Any unhandled error goes to the error handler middleware
- Returns a clean JSON response with status and message
- No server crashes

```json
{
  "message": "Internal Server Error"
}
```

---

## Slide 13 - API Endpoints Summary

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login and get token |
| GET | /api/auth/pending-farmers | Admin | Get unapproved farmers |
| PATCH | /api/auth/:id/approve | Admin | Approve a farmer |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/products | Farmer | Add new product |
| GET | /api/products/available | Public | Get products with filter |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/orders | Business | Create new order |
| GET | /api/orders/my-orders | Business | Get my orders |
| PATCH | /api/orders/:id/status | Any | Update order status |
| PATCH | /api/orders/:id/pay | Business | Confirm payment |

---

## Slide 14 - Project Structure

```
project/
├── models/
│   ├── User.js        → User schema (name, email, password, role, approved)
│   ├── Product.js     → Product schema (farmer, name, category, price, stock)
│   └── Order.js       → Order schema (business, farmer, products, payment)
├── farmlink/
│   ├── config/
│   │   └── db.js          → MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      → Register, Login, Approve farmer
│   │   ├── productcontroller.js   → Add product, View products
│   │   └── orderController.js     → Create order, Track order, Pay
│   ├── middlewares/
│   │   ├── auth.js            → JWT verification, Role checking
│   │   └── errorHandler.js    → Global error handling
│   ├── routes/
│   │   ├── authRoutes.js      → /api/auth/*
│   │   ├── productRoutes.js   → /api/products/*
│   │   └── orderRoutes.js     → /api/orders/*
│   └── validations/
│       ├── authValidation.js      → Register & Login validation
│       ├── productValidation.js   → Product input validation
│       └── orderValidation.js     → Order input validation
└── server.js    → Entry point, security middleware, routes
```

---

## Slide 15 - Summary

### What was built:
- ✅ Full authentication system with JWT and roles
- ✅ Farmer approval system controlled by admin
- ✅ Product management with filtering
- ✅ Complete order flow with stock management
- ✅ Automatic commission calculation (10%)
- ✅ Payment tracking (online / cash)
- ✅ Input validation on all endpoints
- ✅ Global error handling
- ✅ Security best practices (helmet, cors, rate-limit)
- ✅ Postman collection for testing

### What makes this project solid:
- Clean separation of concerns (models, controllers, routes)
- Security applied at multiple levels
- Validation before data reaches the database
- Farmer ID always comes from the token, not the request body
- Stock is automatically managed on every order
- Commission is calculated automatically, no manual input needed
