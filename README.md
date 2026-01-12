# 🎄 Christmas Savings Group - Weekly ₹10 Plan

A full-stack web application for tracking weekly savings of ₹10 for 48 weeks (January 2026 - December 2026).

## 🌐 Live Demo
- **Frontend**: https://christmas-chit-fund.vercel.app
- **Backend API**: https://christmas-jkhp.onrender.com

## 📋 Features

### User Side (No Login Required)
- 🎁 Festive Christmas-themed landing page
- 📅 48-week payment calendar with color-coded status
- 💳 UPI deep link payment integration
- 📊 Payment summary with progress tracking
- 📱 Mobile responsive design

### Admin Panel (Secure Login)
- 🔐 JWT-based authentication
- 📈 Dashboard with collection statistics
- 👥 Member management (Add/Edit/Delete)
- 💰 Payment management and tracking
- 🔍 Filter payments by member, week, status

**Default Admin Login:**
- Username: `admin`
- Password: `Christmas2026!`

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, JWT, Sequelize ORM
- **Database**: MySQL
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
chirstmasss/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── index.js
│   │   ├── Admin.js
│   │   ├── Member.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── members.js
│   │   └── payments.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── schema.sql
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Snowfall.js
│   │   │   ├── WeekCalendar.js
│   │   │   └── PaymentSummary.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── MemberDashboard.js
│   │   │   ├── AdminLogin.js
│   │   │   └── AdminDashboard.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)
- npm or yarn

### Database Setup

1. Install MySQL and start the server
2. Create the database:
```bash
mysql -u root -p
```
```sql
CREATE DATABASE christmas_savings;
```

Or run the schema file:
```bash
mysql -u root -p < backend/schema.sql
```

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your MySQL values:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=christmas_savings
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your-super-secret-key-change-this
PORT=5000
FRONTEND_URL=http://localhost:3000
UPI_ID=yourupi@bank
```

5. Start the server:
```bash
npm run dev
```

The server will automatically create tables on first run.

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm start
```

## 🔑 Default Admin Credentials

The application creates a default admin account on first startup:

| Field    | Value            |
|----------|------------------|
| Username | `admin`          |
| Password | `Christmas2026!` |

⚠️ **Change these credentials in production!**

## 📡 API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all members |
| GET | `/api/members/:id` | Get single member |
| GET | `/api/payments/member/:memberId` | Get member payments |
| POST | `/api/payments` | Initiate payment |
| GET | `/api/config` | Get UPI config |

### Admin Endpoints (Requires Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/verify` | Verify token |
| POST | `/api/members` | Add member |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |
| GET | `/api/payments` | Get all payments |
| GET | `/api/payments/stats` | Get statistics |
| PUT | `/api/payments/:id` | Update payment |

## 🌐 Deployment

### Backend Deployment (Render/Railway)

1. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables:
   - `DB_HOST` - Your MySQL host
   - `DB_PORT` - MySQL port (usually 3306)
   - `DB_NAME` - Database name
   - `DB_USER` - MySQL username
   - `DB_PASSWORD` - MySQL password
   - `JWT_SECRET` - A secure random string
   - `FRONTEND_URL` - Your Vercel frontend URL
   - `UPI_ID` - Your UPI ID for payments

4. Deploy!

### Frontend Deployment (Vercel)

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Set root directory to `frontend`
4. Set environment variable:
   - `REACT_APP_API_URL` - Your backend URL + `/api`

5. Deploy!

### Database Hosting Options

**Option 1: PlanetScale (Recommended - Free tier)**
1. Create account at [PlanetScale](https://planetscale.com)
2. Create a new database
3. Get connection details and update `.env`

**Option 2: Railway MySQL**
1. Add MySQL plugin to your Railway project
2. Use provided connection variables

**Option 3: Local MySQL**
1. Install MySQL locally
2. Run `schema.sql` to create tables

## 📅 Calendar Color Legend

| Color | Status |
|-------|--------|
| 🟢 Green | Paid |
| 🔴 Red | Overdue (past week, not paid) |
| 🟡 Yellow | Current week |
| ⚪ Grey | Upcoming week |

## 💳 UPI Payment Flow

1. User clicks "Pay ₹10 via UPI"
2. App generates UPI deep link with:
   - UPI ID (configured in backend)
   - Amount: ₹10
   - Note: Week number + Member name
3. Opens user's UPI app (GPay, PhonePe, etc.)
4. User completes payment
5. Admin verifies and marks as PAID

## 🔒 Security Notes

- No user authentication (only name selection)
- Users cannot edit payments
- Admin-only payment updates
- JWT tokens expire in 24 hours
- Use HTTPS in production
- Change default admin credentials

## 📊 Database Schema (MySQL)

### admins
```sql
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### members
```sql
CREATE TABLE members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### payments
```sql
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  week_no INT NOT NULL CHECK (week_no >= 1 AND week_no <= 48),
  week_start_date DATE NOT NULL,
  amount DECIMAL(10, 2) DEFAULT 10.00,
  payment_mode ENUM('UPI', 'CASH') DEFAULT 'UPI',
  utr_no VARCHAR(100),
  status ENUM('PAID', 'PENDING') DEFAULT 'PENDING',
  paid_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_week (member_id, week_no)
);
```

## 📱 Screenshots

### Landing Page
- Festive Christmas theme with snowfall
- Member selection dropdown
- Quick stats cards

### Member Dashboard
- Personal payment calendar
- Payment summary
- UPI payment button

### Admin Dashboard
- Collection statistics
- Member management
- Payment tracking table

## 🎯 Future Enhancements

- [ ] SMS/WhatsApp notifications
- [ ] Payment reminders
- [ ] Export reports (PDF/Excel)
- [ ] Multiple savings plans
- [ ] Dark mode toggle

## 📄 License

MIT License - Feel free to use for your community!

## 🤝 Support

For issues or questions, create a GitHub issue or contact the admin.

---

Made with ❤️ for Christmas Savings Groups 🎄
