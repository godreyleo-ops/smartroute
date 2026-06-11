# SmartRoute Admin Panel

Comprehensive admin panel for SmartRoute with Spare Parts Inventory Management system.

## Features

- **User Authentication** - Secure JWT-based login system
- **Dashboard** - Real-time inventory statistics and alerts
- **Spare Parts Management** - CRUD operations for inventory
- **Inventory Tracking** - Track stock movements and changes
- **Stock Alerts** - Automatic alerts for low stock and expiring warranties
- **Supplier Management** - Manage supplier information and contracts
- **Purchase Orders** - Create and track purchase orders
- **Audit Logging** - Complete audit trail of all operations
- **User Management** - Admin user control and permissions

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors

## Installation

### Prerequisites

- Node.js 14+ 
- PostgreSQL 12+
- npm or yarn

### Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create database and run migrations**
   ```bash
   # Create PostgreSQL database
   createdb smartroute_admin
   
   # Run migrations
   npm run db:migrate
   
   # Seed sample data (optional)
   npm run db:seed
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (admin only)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/audit-logs` - View audit logs
- `GET /api/admin/health` - System health check

### Inventory - Spare Parts
- `GET /api/inventory/parts` - List spare parts
- `GET /api/inventory/parts/:id` - Get specific part
- `POST /api/inventory/parts` - Create new part (admin)
- `PUT /api/inventory/parts/:id` - Update part (admin)
- `DELETE /api/inventory/parts/:id` - Delete part (admin)

### Inventory - Categories
- `GET /api/inventory/categories` - List all categories

### Inventory - Movements
- `POST /api/inventory/movements` - Record inventory movement (admin)
- `GET /api/inventory/movements/:part_id` - Get movements for part

### Inventory - Alerts
- `GET /api/inventory/alerts` - Get active alerts
- `PUT /api/inventory/alerts/:id/resolve` - Resolve alert (admin)

### Inventory - Suppliers
- `GET /api/inventory/suppliers` - List suppliers
- `POST /api/inventory/suppliers` - Create supplier (admin)

### Inventory - Purchase Orders
- `GET /api/inventory/purchase-orders` - List purchase orders
- `POST /api/inventory/purchase-orders` - Create purchase order (admin)

## Example Requests

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Get Spare Parts
```bash
curl -X GET http://localhost:3000/api/inventory/parts?category=2&status=AVAIL \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Spare Part
```bash
curl -X POST http://localhost:3000/api/inventory/parts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "part_id": "HW-RAM-002",
    "name": "16GB DDR4 Memory",
    "category_id": 4,
    "manufacturer": "Kingston",
    "critical_level": "HIGH",
    "quantity": 10,
    "unit_cost": 80.00
  }'
```

### Record Inventory Movement
```bash
curl -X POST http://localhost:3000/api/inventory/movements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "part_id": 1,
    "movement_type": "OUT",
    "quantity_change": -2,
    "reason": "System replacement",
    "reference_number": "SR-2026-001"
  }'
```

## Database Schema

See `config/database-schema.sql` for complete schema including:
- Users
- Spare Parts Categories
- Spare Parts
- Suppliers
- Inventory Movements
- Stock Alerts
- Purchase Orders
- Audit Logs

## Project Structure

```
smartroute/
├── config/
│   ├── database.js           # Database connection
│   └── database-schema.sql   # Database schema
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── admin.js             # Admin routes
│   └── inventory.js         # Inventory management routes
├── scripts/
│   ├── migrate.js           # Database migration
│   └── seed.js              # Database seeding
├── server.js                # Main application entry
├── package.json
├── .env.example
└── README.md
```

## Default Credentials

After seeding:
- **Username**: admin
- **Password**: admin123

**Note**: Change these credentials immediately in production!

## Environment Variables

```env
NODE_ENV=development          # Environment
PORT=3000                     # Server port
DB_HOST=localhost             # Database host
DB_PORT=5432                  # Database port
DB_NAME=smartroute_admin      # Database name
DB_USER=smartroute_user       # Database user
DB_PASSWORD=password          # Database password
JWT_SECRET=your_secret        # JWT secret key
JWT_EXPIRE=7d                 # JWT expiration
CORS_ORIGIN=http://localhost:3000  # CORS origins
LOG_LEVEL=debug               # Logging level
```

## Security Considerations

- All API endpoints require JWT authentication (except login/register)
- Admin-only endpoints require admin role
- Passwords are hashed using bcryptjs
- CORS is configured to prevent unauthorized cross-origin requests
- Helmet.js provides security headers
- Input validation on all endpoints
- SQL injection protection through parameterized queries

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
