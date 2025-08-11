# Personal Finance Tracker

A comprehensive personal finance tracking application built with Spring Boot and vanilla JavaScript, featuring a responsive design that works seamlessly across all devices.

## Features

- 📱 **Fully Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 💰 **Income & Expense Tracking** - Easy transaction management
- 📊 **Visual Analytics** - Charts and summaries of your financial data
- 🔐 **Secure Authentication** - User registration and login system
- 📤 **Data Export** - Export transactions to CSV
- 🎨 **Modern UI** - Clean, intuitive interface with smooth animations

## Technology Stack

- **Backend**: Spring Boot 3.5.3, Spring Security, Spring Data JPA
- **Frontend**: Vanilla JavaScript, Bootstrap 5, Chart.js
- **Database**: H2 (development), PostgreSQL (production)
- **Build Tool**: Maven
- **Java Version**: 17

## Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/raghavendra-54/MyPersonal-income-expense-tracker.git
cd MyPersonal-income-expense-tracker/backend
```

2. Run the application:
```bash
./mvnw spring-boot:run
```

3. Open your browser and navigate to `http://localhost:8080`

4. Use the default credentials:
   - Email: `default@example.com`
   - Password: `password`

## Deployment

This application is configured for easy deployment on multiple platforms:

### Railway.app

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the `railway.json` configuration
3. Add a PostgreSQL database service
4. Deploy!

### Render.com

1. Connect your GitHub repository to Render
2. Render will use the `render.yaml` configuration
3. The PostgreSQL database will be automatically provisioned
4. Deploy!

### Heroku

1. Create a new Heroku app
2. Add the Heroku Postgres add-on
3. Deploy using Git:
```bash
git push heroku main
```

### Docker

Build and run with Docker:
```bash
docker build -t finance-tracker .
docker run -p 8080:8080 finance-tracker
```

## Environment Variables

For production deployment, set these environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `DATABASE_DRIVER` - `org.postgresql.Driver`
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `DATABASE_PLATFORM` - `org.hibernate.dialect.PostgreSQLDialect`
- `PORT` - Server port (default: 8080)

## Mobile Responsiveness

The application features:
- **Adaptive Navigation**: Desktop sidebar transforms into mobile bottom navigation
- **Responsive Cards**: Summary cards stack properly on smaller screens
- **Touch-Friendly**: All buttons and interactions optimized for touch
- **Optimized Charts**: Charts resize appropriately for mobile viewing
- **Readable Text**: Font sizes and spacing adjusted for mobile readability

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/transactions/summary` - Get financial summary
- `GET /api/transactions/export` - Export transactions to CSV

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile

## Database Schema

The application uses the following main entities:
- **User**: User account information
- **Transaction**: Income and expense records

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both desktop and mobile
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.