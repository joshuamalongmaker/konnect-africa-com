const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const newsHandler = require('./api/news');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const MONGODB_URI = process.env.MONGODB_URI || (!isProduction ? 'mongodb://127.0.0.1:27017/konnect_africa' : null);
const JWT_SECRET = process.env.JWT_SECRET || (!isProduction ? crypto.randomBytes(32).toString('hex') : null);

if (!JWT_SECRET || Buffer.byteLength(JWT_SECRET, 'utf8') < 32) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 bytes before starting the server.');
}

if (!MONGODB_URI) {
  throw new Error('Set MONGODB_URI before starting the server in production.');
}

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is unset; using an ephemeral development-only secret.');
}

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: ["'self'", 'https://api.gdeltproject.org', 'https://overpass-api.de'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", 'https://unpkg.com', 'https://cdn.tailwindcss.com'],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com']
    }
  },
  frameguard: { action: 'deny' },
  hsts: isProduction ? undefined : false
}));
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.urlencoded({ extended: false, limit: '16kb' }));
app.use(express.json({ limit: '16kb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const privateStaticPath = /^\/(?:server\.js|index\.js|package(?:-lock)?\.json|README\.md|credentials\.json|api\/news\.js|(?:config|models|scripts|node_modules|\.git|uploads)(?:\/|$)|\.env(?:\.|\/|$))/i;
app.use((req, res, next) => {
  if (privateStaticPath.test(req.path)) return res.sendStatus(404);
  next();
});

app.get('/api/news', newsHandler);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const token = /^Bearer\s+([^\s]+)$/i.exec(authorization)?.[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many sign-in attempts. Try again later.' }
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts. Try again later.' }
});

const requireJson = (req, res, next) => {
  if (!req.is('application/json')) {
    return res.status(415).json({ success: false, message: 'Send credentials as JSON.' });
  }
  next();
};

const parseCredentials = (body, isRegistration = false) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

  const { email, password } = body;
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  const normalizedEmail = email.trim().toLowerCase();
  const passwordBytes = Buffer.byteLength(password, 'utf8');

  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    passwordBytes > 72 ||
    (isRegistration && password.length < 12)
  ) {
    return null;
  }

  return { email: normalizedEmail, password };
};

const registerUser = async (req, res) => {
  const credentials = parseCredentials(req.body, true);
  if (!credentials) {
    return res.status(400).json({
      success: false,
      message: 'Use a valid email address and a password of at least 12 characters.'
    });
  }

  try {
    const newUser = new User(credentials);
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: { id: newUser._id, email: newUser.email }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Unable to register with those details.' });
    }
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const loginUser = async (req, res) => {
  const credentials = parseCredentials(req.body);
  if (!credentials) {
    return res.status(400).json({ success: false, message: 'Invalid email or password.' });
  }

  try {
    const user = await User.findOne({ email: credentials.email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(credentials.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

app.post(['/register', '/api/register'], requireJson, registrationLimiter, registerUser);
app.post(['/login', '/api/login'], requireJson, loginLimiter, loginUser);

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "You have access to protected data.",
    user: req.user
  });
});

app.use(express.static(path.join(__dirname), {
  dotfiles: 'deny',
  index: 'index.html',
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});