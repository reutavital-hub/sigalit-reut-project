const jwt = require('jsonwebtoken');

// שליפת המפתח הסודי מקובץ ה-.env
const JWT_SECRET = process.env.JWT_SECRET;

function verifyAdmin(req, res, next) {
  // 1. שליפת כותרת ה-Authorization מהבקשה
  const authHeader = req.headers['authorization'];
  
  // הכותרת מגיעה בפורמט: "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  // 2. בדיקה האם הטוקן בכלל נשלח
  if (!token) {
    return res.status(401).json({ error: 'גישה נדחתה: לא סופק טוקן התחברות' });
  }

  // 3. אימות הטוקן מול המפתח הסודי
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'טוקן לא תקין או שפג תוקפו' });
    }

    // 4. וידוא שלמשתמש יש אכן תפקיד מנהל (admin)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'גישה נדחתה: אין לך הרשאות ניהול' });
    }

    // שמירת פרטי המנהל על הבקשה למקרה שנצטרך אותם בהמשך
    req.admin = decoded;
    
    // מעבר לפונקציה הבאה (ביצוע הפעולה המבוקשת)
    next();
  });
}

module.exports = verifyAdmin;