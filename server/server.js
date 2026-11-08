const express = require("express");
const cors = require("cors");
require("dotenv").config();

const morgan = require("morgan");
const logger = require("./logs/logger");

const prisma = require("./prismaClient");
const authRouter = require("./routes/auth");
const verifyAdmin = require("./middleware/authMiddleware"); // Middleware לאימות טוקן

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware כללי - בסדר הנכון
app.use(cors());
app.use(express.json());

// HTTP request logging with Morgan and Winston
app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        const statusCode = Number(message.match(/"\s(\d{3})\s/)?.[1]);

        if (statusCode >= 500) {
          logger.error(message.trim());
        } else if (statusCode >= 400) {
          logger.warn(message.trim());
        } else {
          logger.info(message.trim());
        }
      },
    },
  }),
);

// נתיבי אימות (Auth)
app.use("/api/admin", authRouter);

// בדיקת שרת בסיסית
app.get("/", (req, res) => {
  res.send("Bakery API is running!");
});

// --- נתיבי מוצרים (Products) ---

// שליפת כל המוצרים הפעילים (פתוח לכולם)
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        options: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    res.json(products);
  } catch (error) {
    logger.error("Error fetching products", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "שגיאה בשליפת המוצרים" });
  }
});

// יצירת מוצר חדש (מוגן למנהלת בלבד)
app.post("/api/products", verifyAdmin, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      image,
      selectionType,
      minQuantity,
      basePrice,
      options,
    } = req.body;

    if (!name || !category || !selectionType) {
      return res.status(400).json({ error: "חסרים פרטי חובה למוצר" });
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
        options:
          options && options.length > 0
            ? {
                create: options.map((opt) => ({
                  name: opt.name,
                  price: Number(opt.price),
                })),
              }
            : undefined,
      },
      include: {
        options: true,
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    logger.error("Error creating product", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "שגיאה ביצירת מוצר חדש" });
  }
});

// השבתת מוצר מהתפריט (מחיקה רכה - מוגן למנהלת)
app.delete("/api/products/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deactivatedProduct = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      message: "המוצר הושבת בהצלחה מהתפריט",
      product: deactivatedProduct,
    });
  } catch (error) {
    logger.error("Error deactivating product", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "שגיאה בהשבתת המוצר" });
  }
});

// שחזור מוצר לתפריט (מוגן למנהלת)
app.patch("/api/products/:id/restore", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const restoredProduct = await prisma.product.update({
      where: { id },
      data: { isActive: true },
    });

    res.json({
      message: "המוצר הוחזר לתפריט בהצלחה",
      product: restoredProduct,
    });
  } catch (error) {
    logger.error("Error restoring product", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "שגיאה בשחזור המוצר" });
  }
});

// --- נתיבי תאריכים חסומים (Blocked Dates) ---

// קבלת כל התאריכים החסומים (פתוח לקליינט כדי לנעול ימים ביומן)
app.get("/api/blocked-dates", async (req, res) => {
  try {
    const dates = await prisma.blockedDate.findMany({
      orderBy: { date: "asc" },
    });
    res.json(dates);
  } catch (error) {
    logger.error("Error fetching blocked dates", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "שגיאה בטעינת תאריכים חסומים" });
  }
});

// חסימת תאריך חדש (מוגן למנהלת)
app.post("/api/blocked-dates", verifyAdmin, async (req, res) => {
  try {
    const { date, reason } = req.body;
    const blocked = await prisma.blockedDate.create({
      data: { date, reason: reason || "תאריך סגור להזמנות" },
    });
    res.status(201).json(blocked);
  } catch (error) {
    res.status(400).json({ error: "התאריך כבר חסום או שהנתונים אינם תקינים" });
  }
});

// פתיחת תאריך חסום (מוגן למנהלת)
app.delete("/api/blocked-dates/:date", verifyAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    await prisma.blockedDate.delete({ where: { date } });
    res.json({ success: true, message: "התאריך נפתח להזמנות" });
  } catch (error) {
    res.status(500).json({ error: "שגיאה בפתיחת התאריך" });
  }
});

const ALLOWED_ORDER_STATUSES = ["ממתין לאישור", "שולם", "מוכן", "הושלם ושולם"];

// --- נתיבי הזמנות (Orders) ---


// יצירת הזמנה חדשה על ידי לקוח (פתוח לכולם)
app.post("/api/orders", async (req, res) => {
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
      items,
    } = req.body;

    // בדיקת שדות חובה
    if (
      !customerName?.trim() ||
      !customerPhone?.trim() ||
      !["pickup", "delivery"].includes(deliveryType) ||
      !deliveryDate ||
      !deliveryTime ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "חסרים שדות חובה לביצוע ההזמנה",
      });
    }

    if (deliveryType === "delivery" && !deliveryAddress?.trim()) {
      return res.status(400).json({
        error: "יש להזין כתובת למשלוח",
      });
    }

    // בדיקת פריטים וחישוב מחירים לפי מסד הנתונים
    const verifiedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (
        typeof item.productId !== "string" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return res.status(400).json({
          error: "נתוני מוצר או כמות אינם תקינים",
        });
      }

      const product = await prisma.product.findFirst({
        where: {
          id: item.productId,
          isActive: true,
        },
        include: {
          options: true,
        },
      });

      if (!product) {
        return res.status(400).json({
          error: "אחד המוצרים אינו זמין להזמנה",
        });
      }

      let unitPrice;

      if (item.productOptionId) {
        const selectedOption = product.options.find(
          (option) => option.id === item.productOptionId
        );

        if (!selectedOption) {
          return res.status(400).json({
            error: "האפשרות שנבחרה אינה שייכת למוצר",
          });
        }

        unitPrice = selectedOption.price;
      } else {
        if (product.options.length > 0) {
          return res.status(400).json({
            error: "יש לבחור אפשרות עבור המוצר",
          });
        }

        unitPrice = product.basePrice;
      }

      if (
        typeof unitPrice !== "number" ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        return res.status(400).json({
          error: "מחיר המוצר אינו תקין",
        });
      }

      if (product.minQuantity && quantity < product.minQuantity) {
        return res.status(400).json({
          error: `הכמות המינימלית למוצר ${product.name} היא ${product.minQuantity}`,
        });
      }

      verifiedItems.push({
        productId: product.id,
        productOptionId: item.productOptionId || null,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      });
    }

    // חישוב הסכום הכולל בצד השרת
    const calculatedTotal = verifiedItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    // יצירת ההזמנה עם המחירים המאומתים
    const newOrder = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryType,
        deliveryAddress:
          deliveryType === "delivery" ? deliveryAddress.trim() : null,
        deliveryDate,
        deliveryTime,
        isGift: Boolean(isGift),
        recipientName: isGift ? recipientName || null : null,
        recipientPhone: isGift ? recipientPhone || null : null,
        recipientAddress: isGift ? recipientAddress || null : null,
        greetingCard: greetingCard || null,
        notes: notes || null,
        totalAmount: calculatedTotal,
        status: "ממתין לאישור",
        items: {
          create: verifiedItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            productOption: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "ההזמנה נוצרה בהצלחה",
      order: newOrder,
    });
  } catch (error) {
    logger.error("Error creating order", {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: "שגיאה ביצירת ההזמנה",
    });
  }
});


// קבלת כל ההזמנות (מוגן למנהלת בלבד)
app.get("/api/orders", verifyAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            productOption: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(orders);
  } catch (error) {
    logger.error("Error fetching orders", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "שגיאה בשליפת ההזמנות" });
  }
});

// עדכון סטטוס הזמנה (מוגן למנהלת בלבד)
app.patch("/api/orders/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!ALLOWED_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        error: "Invalid order status",
      });
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    logger.error("Error updating status", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "שגיאה בעדכון הסטטוס" });
  }
});

// הפעלת השרת

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
