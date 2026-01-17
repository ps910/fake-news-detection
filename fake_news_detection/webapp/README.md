# Fake News Detection Web Application

A comprehensive full-stack web application for detecting fake news using machine learning with explainable AI.

## 🚀 Features

- **AI-Powered Detection**: Logistic Regression model with 94.8% accuracy trained on 72K+ articles
- **Explainable AI**: LIME (Local Interpretable Model-agnostic Explanations) for transparency
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Classification History**: Track and manage all your past classifications
- **Dashboard Analytics**: Visual statistics and insights about your activity
- **Responsive Design**: Beautiful UI that works on all devices

## 📁 Project Structure

```
webapp/
├── backend/                 # Node.js Express backend
│   ├── models/              # MongoDB Mongoose models
│   │   ├── User.js          # User model with auth methods
│   │   └── Classification.js # Classification history model
│   ├── middleware/          # Express middleware
│   │   └── auth.js          # JWT authentication middleware
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── news.js          # News classification routes
│   │   └── user.js          # User management routes
│   ├── server.js            # Express server setup
│   ├── package.json         # Node.js dependencies
│   └── .env.example         # Environment variables template
│
├── frontend/                # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── layout/      # Navbar, Footer
│   │   │   └── ui/          # Button, Card, Input, etc.
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Classify.jsx
│   │   │   ├── History.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/        # API service layer
│   │   ├── store/           # Zustand state management
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
│
└── api/                     # Python Flask ML API
    └── ml_api.py            # ML model endpoints
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** & **cors** for security

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

### ML API
- **Flask** REST API
- **scikit-learn** for classification
- **LIME** for explainability
- **NLTK** for text preprocessing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB (local or Atlas)
- Trained ML model (run training first)

### 1. Setup ML API

```bash
# From project root
cd api
pip install flask flask-cors

# Make sure model is trained
python ../src/pipeline.py  # If not already trained

# Start Flask API
python ml_api.py
# Runs on http://localhost:5000
```

### 2. Setup Backend

```bash
cd webapp/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm run dev
# Runs on http://localhost:3001
```

### 3. Setup Frontend

```bash
cd webapp/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Runs on http://localhost:3000
```

### 4. Access Application

Open http://localhost:3000 in your browser.

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/update | Update profile |
| PUT | /api/auth/password | Change password |

### News Classification
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/news/classify | Classify article |
| POST | /api/news/explain | Get explanation |
| GET | /api/news/history | Get user history |
| DELETE | /api/news/history/:id | Delete classification |
| GET | /api/news/stats | Get user statistics |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/profile | Get profile |
| GET | /api/user/dashboard | Get dashboard data |
| DELETE | /api/user/account | Delete account |

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/fakenews
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
ML_API_URL=http://localhost:5000
NODE_ENV=development
```

## 📊 ML Model Performance

- **Algorithm**: Logistic Regression with TF-IDF
- **Accuracy**: 94.80%
- **ROC-AUC**: 98.87%
- **Training Data**: 72,095 WELFake articles
- **Features**: 5,000 TF-IDF features

## 🎨 UI Features

- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Tailwind CSS color system
- **Animations**: Smooth transitions and loading states
- **Toast Notifications**: Real-time feedback
- **Form Validation**: Client-side validation with error messages

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet security headers

## 📦 Deployment

### Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment

1. Build frontend: `cd frontend && npm run build`
2. Serve static files from backend or use nginx
3. Use PM2 or similar for Node.js process management
4. Use gunicorn for Flask API

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
