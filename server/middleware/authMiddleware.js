
const jwt = require('jsonwebtoken');

// שליפת המפתח הסודי מקובץ ה-.env
const JWT_SECRET = process.env.JWT_SECRET;

function verifyAdmin(req, res, next) {
  // בדיקה שקיים מפתח סודי
  if (!JWT_SECRET) {
    console.error('[AUTH ERROR] JWT_SECRET is missing');
    return res.status(500).json({ error: 'שגיאת הגדרות שרת' });
  }

  // שליפת כותרת Authorization
  const authHeader = req.headers['authorization'];

  // בדיקה שהכותרת קיימת ובפורמט Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'גישה נדחתה: לא סופק טוקן התחברות תקין' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'גישה נדחתה: לא סופק טוקן התחברות' });
  }

  // אימות הטוקן עם האלגוריתם המורשה בלבד
  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'טוקן לא תקין או שפג תוקפו' });
    }

    // בדיקה שהמידע המפוענח תקין ושהמשתמש הוא מנהל
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'גישה נדחתה: אין לך הרשאות ניהול' });
    }

    req.admin = decoded;
    next();
  });
}

module.exports = verifyAdmin;
