const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./prismaClient');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// בדיקת שרת בסיסית
app.get('/', (req, res) => {
  res.send('Bakery API is running!');
});

// נתיב ראשון: שליפת כל המוצרים יחד עם הגדלים/אפשרויות שלהם
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
     where: {
        isActive: true // מציג רק מוצרים פעילים
      },
        include: {
        options: true,
      },
      orderBy: [
        { category: 'asc' }, // מיון לפי קטגוריה
        { name: 'asc' }       // מיון פנימי לפי שם המוצר
      ]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'שגיאה בשליפת המוצרים' });
  }
});

app.post('/api/products', async (req, res) => {
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

// מחיקה רכה - משנה את הסטטוס ל-false במקום למחוק מהמסד
app.delete('/api/products/:id', async (req, res) => {
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

// שחזור מוצר למקרה שתרצי להחזיר אותו לתפריט בעתיד
app.patch('/api/products/:id/restore', async (req, res) => {
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

// נתיב ליצירת הזמנה חדשה
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
      items // מערך של פריטים שנשלח מהסל
    } = req.body;

    // בדיקת שדות חובה בסיסיים
    if (!customerName || !customerPhone || !deliveryType || !deliveryDate || !deliveryTime || !items || items.length === 0) {
      return res.status(400).json({ error: 'חסרים שדות חובה לביצוע ההזמנה' });
    }

    // יצירת ההזמנה והפריטים שלה בטרנזקציה אחת מול מסד הנתונים
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
        status: 'ממתין לתשלום',
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

app.get('/api/orders', async (req, res) => {
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
        createdAt: 'desc' // מהחדש לישן
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'שגיאה בשליפת ההזמנות' });
  }
});

// --- ניהול תאריכים חסומים ---

// קבלת כל התאריכים החסומים
app.get('/api/blocked-dates', async (req, res) => {
  try {
    const dates = await prisma.blockedDate.findMany({
      orderBy: { date: 'asc' }
    });
    res.json(dates);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת תאריכים חסומים' });
  }
});

// חסימת תאריך חדש
app.post('/api/blocked-dates', async (req, res) => {
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

// פתיחת תאריך (מחיקת חסימה)
app.delete('/api/blocked-dates/:date', async (req, res) => {
  try {
    const { date } = req.params;
    await prisma.blockedDate.delete({ where: { date } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בפתיחת התאריך' });
  }
});

// --- ניהול הזמנות ---

// קבלת כל ההזמנות (לדשבורד)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            option: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בשליפת הזמנות' });
  }
});

// עדכון סטטוס הזמנה (למשל: סומן כבוצע / בטיפול)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'COMPLETED', 'PENDING', 'CANCELLED'
    const updated = await prisma.order.update({
      where: { id },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון הסטטוס' });
  }
});

// יצירת הזמנה חדשה ושמירתה במסד הנתונים
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, deliveryDate, deliveryTime, notes, totalAmount, items } = req.body;

    const newOrder = await prisma.order.create({
      data: {
        customerName,
        phone,
        deliveryDate,
        deliveryTime: deliveryTime || '',
        notes: notes || '',
        totalAmount: Number(totalAmount),
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            productId: item.productId || item.id,
            productOptionId: item.selectedOptionId || null,
            quantity: item.quantity,
            price: Number(item.price),
            notes: item.notes || ''
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('שגיאה ביצירת הזמנה:', error);
    res.status(500).json({ error: 'שגיאה בשמירת ההזמנה במסד הנתונים' });
  }
});

// שליפת הזמנות: ברירת מחדל הזמנות פתוחות, או ?status=completed להזמנות עבר
app.get('/api/orders', async (req, res) => {
  try {
    const { status } = req.query;

    let whereClause = {};
    if (status === 'completed') {
      // הזמנות שהושלמו: גם שולם וגם מוכן
      whereClause = { isReady: true, isPaid: true };
    } else {
      // הזמנות פתוחות: לפחות אחד מהם עדיין לא סומן
      whereClause = {
        OR: [
          { isReady: false },
          { isPaid: false }
        ]
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'שגיאה בטעינת ההזמנות' });
  }
});

// עדכון סטטוס מוכן / שולם
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isReady, isPaid } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        ...(isReady !== undefined && { isReady }),
        ...(isPaid !== undefined && { isPaid })
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'שגיאה בעדכון הסטטוס' });
  }
});

// פונקציה לעדכון הסטטוס בשרת
const handleStatusUpdate = async (orderId, field, currentValue) => {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: !currentValue }),
    });

    if (response.ok) {
      // עדכון ה-State המקומי כדי שהשינוי ישתקף מיד במסך
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, [field]: !currentValue } : order
        )
      );
    }
  } catch (error) {
    console.error('שגיאה בעדכון ההזמנה:', error);
  }
};

// תצוגת הכפתורים/צ'קבוקסים בתוך שורת ההזמנה בטבלה
<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
  {/* כפתור/סימון מוכן */}
  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
    <input
      type="checkbox"
      checked={order.isReady}
      onChange={() => handleStatusUpdate(order.id, 'isReady', order.isReady)}
    />
    <span>הזמנה מוכנה</span>
  </label>

  {/* כפתור/סימון שולם */}
  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
    <input
      type="checkbox"
      checked={order.isPaid}
      onChange={() => handleStatusUpdate(order.id, 'isPaid', order.isPaid)}
    />
    <span>שולם</span>
  </label>

  {/* כפתור שליחת וואטסאפ (זמין ברגע שההזמנה מוכנה) */}
  {order.isReady && (
    <button
      onClick={() => sendWhatsAppNotification(order.phone, order.customerName)}
      style={{
        backgroundColor: '#25D366',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '6px 10px',
        cursor: 'pointer',
      }}
    >
      שלח הודעת וואטסאפ
    </button>
  )}
</div>

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

