
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();

// הגנה מפני ניסיונות התחברות חוזרים (Brute Force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  limit: 5, // עד 5 ניסיונות בחלון הזמן
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'יותר מדי ניסיונות התחברות. נסו שוב בעוד 15 דקות.'
  }
});

// שליפת הנתונים ממשתני הסביבה
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET;

// בדיקת תקינות בסיסית של הגדרות השרת
if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !JWT_SECRET) {
  console.error('[CONFIG ERROR] Missing required environment variables in .env');
}

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'שם משתמש וסיסמה הם שדות חובה' });
    }

    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ error: 'פרטי התחברות שגויים' });
    }

    // השוואת הסיסמה ל-Hash השמור
    const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isMatch) {
      return res.status(401).json({ error: 'פרטי התחברות שגויים' });
    }

    // יצירת טוקן עם אלגוריתם HS256 ותוקף של 8 שעות
    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      {
        expiresIn: '8h',
        algorithm: 'HS256'
      }
    );

    console.log(`[AUTH] Admin login successful at ${new Date().toISOString()}`);

    return res.status(200).json({
      message: 'התחברת בהצלחה',
      token
    });

  } catch (error) {
    console.error('[AUTH ERROR]', error);
    return res.status(500).json({ error: 'שגיאת שרת פנימית' });
  }
});

module.exports = router;
