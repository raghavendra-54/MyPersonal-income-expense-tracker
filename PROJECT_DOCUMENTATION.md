# Personal Finance Tracker - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Backend Logic Explanation](#backend-logic-explanation)
4. [Frontend Logic Explanation](#frontend-logic-explanation)
5. [Database Design](#database-design)
6. [API Endpoints](#api-endpoints)
7. [Security Implementation](#security-implementation)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)

---

## 1. Project Overview

### What is this project?
The Personal Finance Tracker is a web application that helps users manage their income and expenses. Think of it as a digital notebook where you can:
- Record money you earn (income)
- Record money you spend (expenses)
- See charts and summaries of your financial data
- Export your data to Excel/CSV files

### Technology Stack
**Backend (Server Side):**
- **Java Spring Boot**: The main framework that handles server logic
- **Spring Security**: Handles user login and security
- **Spring Data JPA**: Manages database operations
- **PostgreSQL**: Database for storing user data (production)
- **H2 Database**: Database for local development

**Frontend (Client Side):**
- **HTML**: Structure of web pages
- **CSS**: Styling and responsive design
- **JavaScript**: Interactive functionality
- **Bootstrap**: CSS framework for responsive design
- **Chart.js**: Library for creating charts

---

## 2. System Architecture

```
┌─────────────────┐    HTTP Requests    ┌─────────────────┐
│                 │ ──────────────────> │                 │
│   Frontend      │                     │    Backend      │
│   (Browser)     │ <────────────────── │  (Spring Boot)  │
│                 │    JSON Responses   │                 │
└─────────────────┘                     └─────────────────┘
                                                │
                                                │ JPA/SQL
                                                ▼
                                        ┌─────────────────┐
                                        │                 │
                                        │   Database      │
                                        │ (PostgreSQL/H2) │
                                        │                 │
                                        └─────────────────┘
```

### How the System Works:
1. **User opens browser** → Loads HTML, CSS, JavaScript files
2. **User performs action** (like adding income) → JavaScript sends HTTP request to backend
3. **Backend processes request** → Validates data, applies business logic
4. **Backend saves to database** → Uses JPA to store/retrieve data
5. **Backend sends response** → Returns JSON data to frontend
6. **Frontend updates display** → Shows updated information to user

---

## 3. Backend Logic Explanation

### 3.1 Project Structure
```
backend/
├── src/main/java/com/finance/tracker/
│   ├── TrackerApplication.java          # Main application entry point
│   ├── config/                          # Configuration files
│   │   ├── SecurityConfig.java          # Security settings
│   │   └── CorsConfig.java             # Cross-origin settings
│   ├── controller/                      # Handle HTTP requests
│   │   ├── AuthController.java          # Login/Register endpoints
│   │   ├── TransactionController.java   # Transaction endpoints
│   │   └── UserController.java          # User profile endpoints
│   ├── service/                         # Business logic
│   │   ├── AuthService.java             # Authentication logic
│   │   ├── TransactionService.java      # Transaction logic
│   │   └── UserService.java             # User management logic
│   ├── model/                           # Data models
│   │   ├── User.java                    # User entity
│   │   ├── Transaction.java             # Transaction entity
│   │   └── TransactionType.java         # Enum for INCOME/EXPENSE
│   ├── repository/                      # Database access
│   │   ├── UserRepository.java          # User database operations
│   │   └── TransactionRepository.java   # Transaction database operations
│   └── dto/                            # Data transfer objects
│       ├── LoginRequest.java            # Login form data
│       ├── RegisterRequest.java         # Registration form data
│       └── CreateTransactionDto.java    # Transaction form data
```

### 3.2 How Backend Components Work Together

#### Controllers (The Waiters)
Controllers are like waiters in a restaurant - they take your order (HTTP request) and bring you food (HTTP response).

**Example: Adding a Transaction**
```java
@PostMapping("/api/transactions")
public ResponseEntity<Transaction> createTransaction(@RequestBody CreateTransactionDto dto) {
    // 1. Receive the request from frontend
    // 2. Pass it to service layer for processing
    Transaction created = transactionService.createTransaction(dto);
    // 3. Return the result to frontend
    return ResponseEntity.ok(created);
}
```

#### Services (The Chefs)
Services contain the business logic - they're like chefs who prepare your food according to recipes.

**Example: Transaction Service Logic**
```java
public Transaction createTransaction(CreateTransactionDto dto) {
    // 1. Get current user (who is logged in?)
    User currentUser = getCurrentAuthenticatedUser();
    
    // 2. Create new transaction object
    Transaction transaction = new Transaction();
    transaction.setTitle(dto.getTitle());
    transaction.setAmount(dto.getAmount());
    transaction.setUser(currentUser);  // Link to user
    
    // 3. Save to database
    return transactionRepository.save(transaction);
}
```

#### Repositories (The Storage)
Repositories handle database operations - they're like the kitchen storage where ingredients are kept.

```java
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Find all transactions for a specific user
    List<Transaction> findAllByUserOrderByDateDesc(User user);
    
    // Calculate total income for a user
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME'")
    Double getTotalIncomeByUser(User user);
}
```

### 3.3 Security Implementation

#### How Authentication Works:
1. **User logs in** → Frontend sends email/password to `/api/auth/login`
2. **Backend validates** → Checks if email exists and password matches
3. **Backend creates token** → Simple token: `email|timestamp`
4. **Frontend stores token** → Saves in localStorage
5. **Future requests** → Frontend sends token in `X-Auth-Token` header
6. **Backend validates token** → Extracts email, finds user, allows access

#### Security Filter Chain:
```java
// This runs for every request
public void doFilterInternal(HttpServletRequest request, HttpServletResponse response) {
    String authToken = request.getHeader("X-Auth-Token");
    if (authToken != null) {
        String userEmail = authToken.split("\\|")[0];  // Extract email
        // Load user and set authentication
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
```

---

## 4. Frontend Logic Explanation

### 4.1 File Structure
```
frontend/
├── index.html                    # Main application page
├── auth/
│   ├── login.html               # Login page
│   ├── register.html            # Registration page
│   └── forgot-password.html     # Password reset page
├── css/
│   └── styles.css               # All styling and responsive design
├── js/
│   ├── app.js                   # Main application logic
│   └── auth.js                  # Authentication logic
└── profile.html                 # User profile page
```

### 4.2 How Frontend Works

#### Single Page Application (SPA) Concept
The main page (`index.html`) never reloads. Instead, JavaScript changes the content dynamically:

```javascript
// When user clicks "Dashboard"
function showDashboard() {
    // 1. Hide current content
    document.getElementById('content-area').innerHTML = '';
    
    // 2. Load dashboard data from backend
    fetch('/api/transactions/summary')
        .then(response => response.json())
        .then(data => {
            // 3. Create HTML with the data
            const html = `
                <div class="row">
                    <div class="col-md-4">
                        <div class="card income-card">
                            <h5>Total Income</h5>
                            <h2>$${data.totalIncome}</h2>
                        </div>
                    </div>
                </div>
            `;
            // 4. Show new content
            document.getElementById('content-area').innerHTML = html;
        });
}
```

#### Navigation System
```javascript
// Desktop and mobile navigation
document.addEventListener('DOMContentLoaded', () => {
    // Add click listeners to all navigation links
    document.querySelectorAll('[href="#dashboard"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showDashboard();
            updateActiveNavigation('dashboard');
        });
    });
});
```

#### Form Handling
```javascript
// Example: Adding income
async function handleIncomeSubmit(e) {
    e.preventDefault();
    
    // 1. Get form data
    const formData = {
        title: document.getElementById('title').value,
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        type: 'INCOME',
        category: document.getElementById('category').value
    };
    
    // 2. Send to backend
    const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': localStorage.getItem('authToken')
        },
        body: JSON.stringify(formData)
    });
    
    // 3. Handle response
    if (response.ok) {
        showAlert('Income added successfully!', 'success');
        loadTransactions(); // Refresh the list
    }
}
```

### 4.3 Responsive Design

#### Desktop vs Mobile Layout
```css
/* Desktop: Sidebar on left */
@media (min-width: 769px) {
    .sidebar { display: block; }
    .mobile-nav { display: none; }
    main { margin-left: 16.67%; }
}

/* Mobile: Header on top, navigation on bottom */
@media (max-width: 768px) {
    .sidebar { display: none; }
    .mobile-header { display: block; }
    .mobile-nav { display: block; }
    main { 
        margin-left: 0; 
        padding-top: 80px;  /* Space for header */
        padding-bottom: 80px; /* Space for bottom nav */
    }
}
```

#### Chart Responsiveness
```javascript
// Charts automatically resize based on screen size
const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: window.innerWidth < 768 ? 'bottom' : 'right'
        }
    }
};
```

---

## 5. Database Design

### 5.1 Database Tables

#### Users Table (`app_user`)
```sql
CREATE TABLE app_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    password VARCHAR(255) NOT NULL
);
```

#### Transactions Table
```sql
CREATE TABLE transaction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL,  -- 'INCOME' or 'EXPENSE'
    category VARCHAR(255),
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES app_user(id)
);
```

### 5.2 Relationships
```
User (1) ──────── (Many) Transaction
│                        │
├─ id                    ├─ id
├─ email                 ├─ title
├─ password              ├─ amount
└─ ...                   ├─ type
                         ├─ user_id (FK)
                         └─ ...
```

**Explanation:**
- One user can have many transactions
- Each transaction belongs to exactly one user
- `user_id` in transactions table links to `id` in users table

### 5.3 JPA Entity Relationships
```java
// User.java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Transaction> transactions;
}

// Transaction.java
@Entity
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
```

---

## 6. API Endpoints

### 6.1 Authentication Endpoints

#### POST `/api/auth/register`
**Purpose:** Create new user account
**Request Body:**
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "position": "Employee",
    "address": "123 Main St",
    "password": "password123",
    "confirmPassword": "password123"
}
```
**Response:**
```json
{
    "message": "Registration successful. Please log in.",
    "token": null,
    "userId": null
}
```

#### POST `/api/auth/login`
**Purpose:** User login
**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```
**Response:**
```json
{
    "message": "Login successful",
    "token": "john@example.com|1703123456789",
    "userId": 1,
    "firstName": "John",
    "lastName": "Doe"
}
```

### 6.2 Transaction Endpoints

#### GET `/api/transactions/summary`
**Purpose:** Get financial summary
**Headers:** `X-Auth-Token: john@example.com|1703123456789`
**Response:**
```json
{
    "totalIncome": 5000.00,
    "totalExpense": 2000.00,
    "balance": 3000.00
}
```

#### POST `/api/transactions`
**Purpose:** Create new transaction
**Headers:** `X-Auth-Token: john@example.com|1703123456789`
**Request Body:**
```json
{
    "title": "Salary",
    "amount": 3000.00,
    "date": "2024-01-15",
    "type": "INCOME",
    "category": "Job"
}
```

#### GET `/api/transactions`
**Purpose:** Get all transactions with optional filters
**Headers:** `X-Auth-Token: john@example.com|1703123456789`
**Query Parameters:**
- `type`: INCOME or EXPENSE
- `category`: Filter by category
- `startDate`: Filter from date
- `endDate`: Filter to date

---

## 7. Security Implementation

### 7.1 Authentication Flow Diagram
```
┌─────────────┐    1. Login Request    ┌─────────────┐
│             │ ────────────────────> │             │
│  Frontend   │                       │   Backend   │
│             │ <──────────────────── │             │
└─────────────┘    2. Token Response  └─────────────┘
       │                                     │
       │ 3. Store Token                      │ 4. Validate Password
       ▼                                     ▼
┌─────────────┐                       ┌─────────────┐
│ localStorage│                       │  Database   │
│             │                       │             │
└─────────────┘                       └─────────────┘

┌─────────────┐  5. Future Requests   ┌─────────────┐
│             │ ────────────────────> │             │
│  Frontend   │   (with X-Auth-Token) │   Backend   │
│             │ <──────────────────── │             │
└─────────────┘    6. Authorized      └─────────────┘
                      Response
```

### 7.2 Security Features

#### Password Encryption
```java
// Passwords are encrypted using BCrypt
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// When user registers
String hashedPassword = passwordEncoder.encode(plainPassword);
user.setPassword(hashedPassword);
```

#### CORS Configuration
```java
// Allow requests from different origins (for development)
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:*")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}
```

#### Request Authorization
```java
// Only authenticated users can access transaction endpoints
.authorizeHttpRequests(authorize -> authorize
    .requestMatchers("/api/auth/**").permitAll()  // Anyone can login/register
    .anyRequest().authenticated()                 // Everything else needs login
)
```

---

## 8. Deployment Guide

### 8.1 Environment Configuration

#### Development (Local)
```properties
# application.properties
spring.datasource.url=jdbc:h2:file:./data/finances
spring.datasource.driverClassName=org.h2.Driver
spring.h2.console.enabled=true
```

#### Production (Deployed)
```properties
# Environment variables set by hosting platform
spring.datasource.url=${DATABASE_URL}
spring.datasource.driverClassName=${DATABASE_DRIVER:org.postgresql.Driver}
spring.jpa.database-platform=${DATABASE_PLATFORM:org.hibernate.dialect.PostgreSQLDialect}
```

### 8.2 Deployment Platforms

#### Railway.app
1. Connect GitHub repository
2. Railway detects Spring Boot app automatically
3. Add PostgreSQL database service
4. Environment variables are set automatically

#### Render.com
1. Create web service from GitHub
2. Build command: `./mvnw clean package -DskipTests`
3. Start command: `java -Dserver.port=$PORT -jar target/tracker-0.0.1-SNAPSHOT.jar`
4. Add PostgreSQL database
5. Set environment variables

#### Heroku
1. Create Heroku app
2. Add Heroku Postgres add-on
3. Deploy using Git or GitHub integration
4. Environment variables set automatically

---

## 9. Troubleshooting

### 9.1 Common Issues

#### "User not authenticated" Error
**Cause:** Token missing or invalid
**Solution:**
1. Check if token exists in localStorage
2. Verify token format: `email|timestamp`
3. Re-login if token is corrupted

#### Database Connection Error
**Cause:** Database URL or credentials incorrect
**Solution:**
1. Check environment variables
2. Verify database service is running
3. Check connection string format

#### CORS Error
**Cause:** Frontend and backend on different domains
**Solution:**
1. Update CORS configuration
2. Add frontend domain to allowed origins
3. Check if credentials are allowed

#### Mobile View Issues
**Cause:** CSS media queries not working
**Solution:**
1. Check viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
2. Verify CSS media query syntax
3. Test on actual mobile device

### 9.2 Debugging Tips

#### Backend Debugging
```java
// Add logging to see what's happening
@Service
public class TransactionService {
    public Transaction createTransaction(CreateTransactionDto dto) {
        System.out.println("Creating transaction: " + dto.getTitle());
        User currentUser = getCurrentAuthenticatedUser();
        System.out.println("Current user: " + currentUser.getEmail());
        // ... rest of method
    }
}
```

#### Frontend Debugging
```javascript
// Use console.log to debug
async function loadTransactions() {
    console.log('Loading transactions...');
    const token = localStorage.getItem('authToken');
    console.log('Using token:', token);
    
    const response = await fetch('/api/transactions', {
        headers: { 'X-Auth-Token': token }
    });
    console.log('Response status:', response.status);
}
```

#### Network Debugging
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Perform action that's failing
4. Check request/response details
5. Look for error status codes (400, 401, 500)

---

## Conclusion

This Personal Finance Tracker demonstrates a complete full-stack web application with:

- **Secure user authentication**
- **RESTful API design**
- **Responsive mobile-first UI**
- **Database relationships**
- **Modern deployment practices**

The application follows industry best practices and can serve as a foundation for more complex financial applications. The modular architecture makes it easy to add new features like budgeting, categories, or financial goals.

For beginners, this project covers essential concepts in web development:
- Backend API development with Spring Boot
- Frontend JavaScript and responsive design
- Database design and relationships
- Security and authentication
- Deployment and DevOps

The codebase is well-structured and documented, making it an excellent learning resource for understanding how modern web applications are built and deployed.