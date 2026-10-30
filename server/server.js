const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./prismaClient');
const authRouter = require('./routes/auth');
const verifyAdmin = require('./middleware/authMiddleware'); // Middleware לאימות טוקן

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware כללי - בסדר הנכון
app.use(cors());
app.use(express.json());

// נתיבי אימות (Auth)
app.use('/api/admin', authRouter);

// בדיקת שרת בסיסית
app.get('/', (req, res) => {
  res.send('Bakery API is running!');
});

// --- נתיבי מוצרים (Products) ---

// שליפת כל המוצרים הפעילים (פתוח לכולם)
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        options: true,
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'שגיאה בשליפת המוצרים' });
  }
});

// יצירת מוצר חדש (מוגן למנהלת בלבד)
app.post('/api/products', verifyAdmin, async (req, res) => {
  try {
    const { name, category, description, image, selectionType, minQuantity, basePrice, options } = req.body;

    if (!name || !category || !selectionType) {
      return res.status(400).json({ error: 'חסרים פרטי חובה למוצר' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        category,
        description,
        image,
        selectionType,
        minQuantity: minQuantity ? Number(minQuantity) : null,
        basePrice: basePrice ? Number(basePrice) : null,
        options: options && options.length > 0 ? {
          create: options.map(opt => ({
            name: opt.name,
            price: Number(opt.price)
          }))
        } : undefined
      },
      include: {
        options: true
      }
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'שגיאה ביצירת מוצר חדש' });
  }
});

// השבתת מוצר מהתפריט (מחיקה רכה - מוגן למנהלת)
app.delete('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deactivatedProduct = await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'המוצר הושבת בהצלחה מהתפריט', product: deactivatedProduct });
  } catch (error) {
    console.error('Error deactivating product:', error);
    res.status(500).json({ error: 'שגיאה בהשבתת המוצר' });
  }
});

// שחזור מוצר לתפריט (מוגן למנהלת)
app.patch('/api/products/:id/restore', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const restoredProduct = await prisma.product.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({ message: 'המוצר הוחזר לתפריט בהצלחה', product: restoredProduct });
  } catch (error) {
    console.error('Error restoring product:', error);
    res.status(500).json({ error: 'שגיאה בשחזור המוצר' });
  }
});

// --- נתיבי תאריכים חסומים (Blocked Dates) ---

// קבלת כל התאריכים החסומים (פתוח לקליינט כדי לנעול ימים ביומן)
app.get('/api/blocked-dates', async (req, res) => {
  try {
    const dates = await prisma.blockedDate.findMany({
      orderBy: { date: 'asc' }
    });
    res.json(dates);
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    res.status(500).json({ error: 'שגיאה בטעינת תאריכים חסומים' });
  }
});

// חסימת תאריך חדש (מוגן למנהלת)
app.post('/api/blocked-dates', verifyAdmin, async (req, res) => {
  try {
    const { date, reason } = req.body;
    const blocked = await prisma.blockedDate.create({
      data: { date, reason: reason || 'תאריך סגור להזמנות' }
    });
    res.status(201).json(blocked);
  } catch (error) {
    res.status(400).json({ error: 'התאריך כבר חסום או שהנתונים אינם תקינים' });
  }
});

// פתיחת תאריך חסום (מוגן למנהלת)
app.delete('/api/blocked-dates/:date', verifyAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    await prisma.blockedDate.delete({ where: { date } });
    res.json({ success: true, message: 'התאריך נפתח להזמנות' });
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בפתיחת התאריך' });
  }
});

// --- נתיבי הזמנות (Orders) ---

// יצירת הזמנה חדשה על ידי לקוח (פתוח לכולם)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      deliveryType,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      isGift,
      recipientName,
      recipientPhone,
      recipientAddress,
      greetingCard,
      notes,
      totalAmount,
      items
    } = req.body;

    if (!customerName || !customerPhone || !deliveryType || !deliveryDate || !deliveryTime || !items || items.length === 0) {
      return res.status(400).json({ error: 'חסרים שדות חובה לביצוע ההזמנה' });
    }

    const newOrder = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : null,
        deliveryDate,
        deliveryTime,
        isGift: Boolean(isGift),
        recipientName: isGift ? recipientName : null,
        recipientPhone: isGift ? recipientPhone : null,
        recipientAddress: isGift ? recipientAddress : null,
        greetingCard: greetingCard || null,
        notes: notes || null,
        totalAmount: Number(totalAmount),
        status: 'ממתין לאישור',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            productOptionId: item.productOptionId || null,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.unitPrice) * Number(item.quantity)
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true,
            productOption: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'ההזמנה נוצרה בהצלחה',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'שגיאה ביצירת ההזמנה' });
  }
});

// קבלת כל ההזמנות (מוגן למנהלת בלבד)
app.get('/api/orders', verifyAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            productOption: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'שגיאה בשליפת ההזמנות' });
  }
});

// עדכון סטטוס הזמנה (מוגן למנהלת בלבד)
app.patch('/api/orders/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.order.update({
      where: { id },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'שגיאה בעדכון הסטטוס' });
  }
});

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});