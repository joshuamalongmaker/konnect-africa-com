const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const cors = require('cors');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NEWS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
const NEWS_QUERY = '(Africa OR "South Sudan" OR Uganda OR Kenya OR Tanzania OR Ethiopia) (agriculture OR fisheries OR livelihoods OR "community development" OR governance OR sustainability)';

let newsCache = {
  articles: [],
  updatedAt: null,
  warning: null
};
let newsRefreshInProgress = null;

const parseGdeltDate = value => {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(value || '');
  if (!match) return null;

  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const refreshNews = () => {
  if (newsRefreshInProgress) return newsRefreshInProgress;

  newsRefreshInProgress = (async () => {
    try {
      const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
      url.searchParams.set('query', NEWS_QUERY);
      url.searchParams.set('mode', 'ArtList');
      url.searchParams.set('format', 'json');
      url.searchParams.set('maxrecords', '20');
      url.searchParams.set('sort', 'DateDesc');
      url.searchParams.set('timespan', '1d');

      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) {
        throw new Error(`News provider returned HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!Array.isArray(result.articles)) {
        throw new Error('News provider returned an invalid response');
      }

      const articles = result.articles
        .filter(article => typeof article.title === 'string' && typeof article.url === 'string')
        .map(article => {
          let articleUrl;
          try {
            articleUrl = new URL(article.url);
          } catch {
            return null;
          }
          if (!['http:', 'https:'].includes(articleUrl.protocol)) return null;

          return {
            title: article.title.trim(),
            url: articleUrl.href,
            source: typeof article.domain === 'string' ? article.domain : '',
            publishedAt: parseGdeltDate(article.seendate)
          };
        })
        .filter(article => article && article.title)
        .filter((article, index, list) =>
          list.findIndex(candidate => candidate.url === article.url) === index
        );

      if (!articles.length) {
        throw new Error('News provider returned no recent articles');
      }

      newsCache = {
        articles,
        updatedAt: new Date().toISOString(),
        warning: null
      };
    } catch (error) {
      newsCache.warning = 'Live news is temporarily unavailable. Please try again later.';
      console.error('News refresh error:', error);
    } finally {
      newsRefreshInProgress = null;
    }
  })();

  return newsRefreshInProgress;
};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/credentials.json', (req, res) => res.sendStatus(404));
app.use(express.static(path.join(__dirname)));
app.use(cors());

app.get('/api/news', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const status = newsCache.articles.length ? 200 : newsCache.warning ? 502 : 503;
  res.status(status).json(newsCache);
});

refreshNews();
setInterval(refreshNews, NEWS_REFRESH_INTERVAL_MS);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/konnect_africa';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Set JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Register route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "User already exists." });

    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: { id: newUser._id, email: newUser.email }
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// API Register route (for frontend)
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "User already exists." });

    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: { id: newUser._id, email: newUser.email }
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (!user.password) return res.status(400).json({ success: false, message: "Google login only." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect password." });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: { id: user._id, email: user.email }
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// API Login route (for frontend)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (!user.password) return res.status(400).json({ success: false, message: "Google login only." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect password." });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: { id: user._id, email: user.email }
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "You have access to protected data.",
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});