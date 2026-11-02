require('dotenv').config(); // טוען את המשתנים מקובץ ה-.env לתוך process.env
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// שליפת הנתונים ישירות ממשתני הסביבה
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET;

// בדיקת תקינות בסיסית בעליית השרת לווידוא שההגדרות קיימות
if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !JWT_SECRET) {
  console.error('[CONFIG ERROR] Missing required environment variables in .env');
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'שם משתמש וסיסמה הם שדות חובה' });
    }

    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ error: 'פרטי התחברות שגויים' });
    }

    // השוואה של הפרטים מול הHASH
    const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ error: 'פרטי התחברות שגויים' });
    }

// יצירת טוקן
    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
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