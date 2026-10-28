// const prisma = require('./prismaClient');

// const initialProducts = [
//   // --- מלוחים וסלטים ---
//   {
//     name: "קיש בצל ופטריות",
//     category: "מלוחים וסלטים",
//     description: "",
//     selectionType: "size",
//     options: [
//       { name: "קוטר 20", price: 70 },
//       { name: "קוטר 24", price: 120 }
//     ]
//   },
//   {
//     name: "קיש בטטה",
//     category: "מלוחים וסלטים",
//     description: "",
//     selectionType: "size",
//     options: [
//       { name: "קוטר 20", price: 70 },
//       { name: "קוטר 24", price: 120 }
//     ]
//   },
//   {
//     name: "קיש ברוקולי",
//     category: "מלוחים וסלטים",
//     description: "",
//     selectionType: "size",
//     options: [
//       { name: "קוטר 20", price: 70 },
//       { name: "קוטר 24", price: 120 }
//     ]
//   },
//   {
//     name: "קיש גבינות",
//     category: "מלוחים וסלטים",
//     description: "",
//     selectionType: "size",
//     options: [
//       { name: "קוטר 20", price: 80 },
//       { name: "קוטר 24", price: 130 }
//     ]
//   },
//   {
//     name: "קיש גבינת עיזים על בסיס בטטה",
//     category: "מלוחים וסלטים",
//     description: "הקיש ללא גלוטן",
//     selectionType: "size",
//     options: [
//       { name: "קוטר 26", price: 140 }
//     ]
//   },
//   {
//     name: "לזניה",
//     category: "מלוחים וסלטים",
//     description: "בתבנית שמותאמת לחימום",
//     selectionType: "size",
//     options: [
//       { name: "תבנית זוגית", price: 25 },
//       { name: "תבנית גדולה", price: 110 }
//     ]
//   },
//   {
//     name: "בניצה",
//     category: "מלוחים וסלטים",
//     description: "מאפה פילו במילוי גבינות",
//     selectionType: "size",
//     options: [
//       { name: "קוטר 22", price: 120 }
//     ]
//   },
//   {
//     name: "סלט חסה והפתעות",
//     category: "מלוחים וסלטים",
//     description: "",
//     selectionType: "size",
//     options: [
//       { name: "קטן", price: 45 },
//       { name: "גדול", price: 120 }
//     ]
//   },
//   {
//     name: "סלט קינואה ועדשים שחורות",
//     category: "מלוחים וסלטים",
//     description: "",
//     selectionType: "size",
//     options: [
//       { name: "קטן", price: 45 },
//       { name: "גדול", price: 120 }
//     ]
//   },
//   {
//     name: "סלט ירקות וגרנולה מלוחה",
//     category: "מלוחים וסלטים",
//     description: "",
//     selectionType: "size",
//     options: [
//       { name: "קטן", price: 45 },
//       { name: "גדול", price: 120 }
//     ]
//   },
//   {
//     name: "סלט כרוב ומלא פיצוחים",
//     category: "מלוחים וסלטים",
//     description: "",
//     selectionType: "size",
//     options: [
//       { name: "קטן", price: 45 },
//       { name: "גדול", price: 120 }
//     ]
//   },
//   {
//     name: "סלט יווני",
//     category: "מלוחים וסלטים",
//     description: "חלבי",
//     selectionType: "size",
//     options: [
//       { name: "קטן", price: 45 },
//       { name: "גדול", price: 120 }
//     ]
//   },
//   {
//     name: "סלט עגבניות שרי עם פטריות ובייבי מוצרלה",
//     category: "מלוחים וסלטים",
//     description: "חלבי",
//     selectionType: "size",
//     options: [
//       { name: "קטן", price: 45 },
//       { name: "גדול", price: 120 }
//     ]
//   },

//   // --- לחמים וממרחים ---
//   {
//     name: "גבינת שמנת",
//     category: "לחמים וממרחים",
//     description: "",
//     selectionType: "fixed",
//     basePrice: 10
//   },
//   {
//     name: "טחינה",
//     category: "לחמים וממרחים",
//     description: "",
//     selectionType: "fixed",
//     basePrice: 10
//   },
//   {
//     name: "טפנד",
//     category: "לחמים וממרחים",
//     description: "",
//     selectionType: "fixed",
//     basePrice: 15
//   },
//   {
//     name: "ממרח עגבניות",
//     category: "לחמים וממרחים",
//     description: "",
//     selectionType: "fixed",
//     basePrice: 15
//   },
//   {
//     name: "לחמניות כוסמין",
//     category: "לחמים וממרחים",
//     description: "מינימום הזמנה: 20 יחידות",
//     selectionType: "min_quantity",
//     minQuantity: 20,
//     basePrice: 2.5
//   },
//   {
//     name: "פרצלך",
//     category: "לחמים וממרחים",
//     description: "6 יחידות ב-22 ש\"ח",
//     selectionType: "presets",
//     basePrice: 22
//   },
//   {
//     name: "לחם זיתים",
//     category: "לחמים וממרחים",
//     description: "",
//     selectionType: "fixed",
//     basePrice: 22
//   },
//   {
//     name: "לחם הפתעות",
//     category: "לחמים וממרחים",
//     description: "70% קמח מלא עם קינואה, חמוציות וגרעיני דלעת",
//     selectionType: "fixed",
//     basePrice: 25
//   },
//   {
//     name: "לחם כוסמין",
//     category: "לחמים וממרחים",
//     description: "100% קמח כוסמין",
//     selectionType: "fixed",
//     basePrice: 25
//   },
//   {
//     name: "לחם פיצוחים",
//     category: "לחמים וממרחים",
//     description: "70% קמח מלא והרבה פיצוחים",
//     selectionType: "fixed",
//     basePrice: 25
//   },
//   {
//     name: "לחם שיפון",
//     category: "לחמים וממרחים",
//     description: "100% שיפון עם פקאן וחמוציות",
//     selectionType: "fixed",
//     basePrice: 30
//   }
// ];

// async function seed() {
//   try {
//     console.log('מנקה מוצרים קודמים...');
//     await prisma.productOption.deleteMany();
//     await prisma.product.deleteMany();

//     console.log('מכניס מוצרים חדשים למסד הנתונים...');
//     for (const item of initialProducts) {
//       const { options, ...productData } = item;
//       await prisma.product.create({
//         data: {
//           ...productData,
//           options: options ? { create: options } : undefined
//         }
//       });
//     }

//     console.log('ההזנה הסתיימה בהצלחה!');
//   } catch (error) {
//     console.error('שגיאה בהזנת הנתונים:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// seed();


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const realProducts = [
  // ==============================
  // 1. לחמים וממרחים
  // ==============================
  {
    name: 'חלה "רגילה"',
    description: 'חלת שבת קלאסית, אוורירית, רכה וזהובה.',
    category: 'לחמים וממרחים',
    basePrice: 15,
    minQuantity: 1
  },
  {
    name: 'חלת כוסמין 100%',
    description: 'חלה בריאה ורכה מקמח כוסמין מלא 100%.',
    category: 'לחמים וממרחים',
    basePrice: 22,
    minQuantity: 1
  },
  {
    name: 'חלת עשבי תיבול',
    description: 'חלה עשירה בעשבי תיבול ריחניים וטריים.',
    category: 'לחמים וממרחים',
    basePrice: 25,
    minQuantity: 1
  },
  {
    name: 'חלת שושנים במילוי צ\'ימיצ\'ורי',
    description: 'חלת שושנים מעוצבת במילוי צ\'ימיצ\'ורי עשיר ומלא טעם.',
    category: 'לחמים וממרחים',
    basePrice: 22,
    minQuantity: 1
  },

  // ==============================
  // 2. עוגות פס
  // ==============================
  {
    name: 'שמרים שוקולד',
    description: 'עוגת שמרים עשירה עם שכבת קקאו ושכבת נוטלה. חלבי.',
    category: 'עוגות פס',
    basePrice: 50,
    minQuantity: 1
  },
  {
    name: 'שמרים לוטוס',
    description: 'עוגת שמרים עשירה עם 2 שכבות של לוטוס ושוקולד לבן. חלבי.',
    category: 'עוגות פס',
    basePrice: 50,
    minQuantity: 1
  },
  {
    name: 'שמרים אגוזים (חלבי)',
    description: 'עוגת שמרים עשירה עם 2 שכבות של מלא אגוזים וקינמון. חלבי.',
    category: 'עוגות פס',
    basePrice: 50,
    minQuantity: 1
  },
  {
    name: 'שמרים גבינה ופירות יער',
    description: 'בצק פרסבורג נימוח במילוי גבינת שמנת ופירות יער. חלבי.',
    category: 'עוגות פס',
    basePrice: 55,
    minQuantity: 1
  },
  {
    name: 'שמרים קקאו (פרווה)',
    description: 'עוגה עשירה במילוי ממרח קקאו ביתי מנחם. פרווה.',
    category: 'עוגות פס',
    basePrice: 50,
    minQuantity: 1
  },
  {
    name: 'שמרים אגוזים וקינמון (פרווה)',
    description: 'עוגה עשירה עם שפע אגוזים וקינמון. פרווה.',
    category: 'עוגות פס',
    basePrice: 50,
    minQuantity: 1
  },
  {
    name: 'עוגת גזר וחמוציות',
    description: 'עוגה בחושה עסיסית עם גזר, חמוציות ואגוזים. פרווה.',
    category: 'עוגות פס',
    basePrice: 50,
    minQuantity: 1
  },
  {
    name: 'עוגת בטטה ופקאן מלוח',
    description: 'שילוב טעמים מיוחד וממכר, מכילה אגוזים. פרווה.',
    category: 'עוגות פס',
    basePrice: 50,
    minQuantity: 1
  },
  {
    name: 'עוגת מייפל',
    description: 'עוגה רכה ונימוחה בניחוח מייפל עשיר, מכילה אגוזים. פרווה.',
    category: 'עוגות פס',
    basePrice: 50,
    minQuantity: 1
  },
  {
    name: 'עוגת סבתא',
    description: 'המתכון הנוסטלגי של סבתא רבקה עם שברי אגוזים ושוקולד. פרווה.',
    category: 'עוגות פס',
    basePrice: 50,
    minQuantity: 1
  },
  {
    name: 'עוגת גבינה וחמאת בוטנים',
    description: 'על בסיס בייגלה פריך ושוקולד בלונדי. חלבי.',
    category: 'עוגות פס',
    basePrice: 80,
    minQuantity: 1
  },

  // ==============================
  // 3. עוגות עגולות
  // ==============================
  {
    name: 'פאי גבינה לימון',
    description: 'פאי מרענן עם קרם גבינה עשיר וקרם לימון חמצמץ. חלבי.',
    category: 'עוגות עגולות',
    options: [
      { name: 'קוטר 20 ס"מ', price: 100 },
      { name: 'קוטר 24 ס"מ', price: 150 }
    ]
  },
  {
    name: 'עוגת גבינה ושוקולד לבן אפויה',
    description: 'עוגת גבינה אפויה קלאסית עם שוקולד לבן מובחר. חלבי.',
    category: 'עוגות עגולות',
    options: [
      { name: 'קוטר 16 ס"מ', price: 80 },
      { name: 'קוטר 22 ס"מ', price: 130 }
    ]
  },
  {
    name: 'עוגת פאדג\' שוקולד',
    description: 'עוגת שוקולד פאדג\'ית ועשירה במיוחד (קוטר 18 ס"מ). ניתן לבחור חלבי או פרווה בהערות.',
    category: 'עוגות עגולות',
    basePrice: 140,
    minQuantity: 1
  },
  {
    name: 'פאי פלאן',
    description: 'פאי פלאן צרפתי קרמי ואלגנטי. חלבי.',
    category: 'עוגות עגולות',
    options: [
      { name: 'קוטר 20 ס"מ', price: 80 },
      { name: 'קוטר 24 ס"מ', price: 130 }
    ]
  },
  {
    name: 'פאי עקיצת הדבורה',
    description: 'בצק פריך עם קרם פטיסייר וציפוי שקדים מקורמלים בדבש. חלבי.',
    category: 'עוגות עגולות',
    options: [
      { name: 'קוטר 20 ס"מ', price: 80 },
      { name: 'קוטר 24 ס"מ', price: 130 }
    ]
  },
  {
    name: 'עוגת נוטלה, שוקולד לבן וקפה',
    description: 'עוגה חגיגית עם קרם שוקולד לבן ונגיעות קפה. חלבי.',
    category: 'עוגות עגולות',
    basePrice: 70,
    minQuantity: 1
  },
  {
    name: 'עוגת גבינת ריקוטה וקרמבל קקאו',
    description: 'שילוב מושלם של גבינת ריקוטה עדינה עם קרמבל קקאו פריך. חלבי.',
    category: 'עוגות עגולות',
    options: [
      { name: 'קוטר 18 ס"מ', price: 80 },
      { name: 'קוטר 22 ס"מ', price: 140 }
    ]
  },
  {
    name: 'עוגת קרפים (קוטר 18)',
    description: 'מגדל שכבות קרפים אווריריים במילוי קרם עשיר. חלבי.',
    category: 'עוגות עגולות',
    options: [
      { name: 'רגיל', price: 220 },
      { name: 'ללא גלוטן (לל"ג)', price: 250 }
    ]
  },
  {
    name: 'עוגת פחזנית (קוטר 22)',
    description: 'בצק רבוך אפוי למשעי במילוי קרם פטיסייר עשיר. חלבי.',
    category: 'עוגות עגולות',
    basePrice: 135,
    minQuantity: 1
  },
  {
    name: 'עוגת מוס דו-קולד',
    description: 'על בסיס בראוניז שוקולדי עשיר עם שכבות מוס והפתעות. חלבי.',
    category: 'עוגות עגולות',
    options: [
      { name: 'קוטר 16 ס"מ', price: 155 },
      { name: 'קוטר 22 ס"מ', price: 265 }
    ]
  },
  {
    name: 'קראק פאי (קוטר 20)',
    description: 'הפאי המפורסם במילוי שיבולת שועל, חמאה וקרמל. חלבי.',
    category: 'עוגות עגולות',
    basePrice: 85,
    minQuantity: 1
  },
  {
    name: 'שמרים עגולה חגיגית',
    description: 'עוגת שמרים גדולה ומפנקת. חלבי. בחרו טעם מועדף בהערות: שוקולד / לוטוס / אגוזים.',
    category: 'עוגות עגולות',
    basePrice: 95,
    minQuantity: 1
  },
  {
    name: 'עוגת כדורי שוקולד חגיגית',
    description: 'עוגת כדורי שוקולד מושחתת. ניתן לבחור חלבי או פרווה בהערות.',
    category: 'עוגות עגולות',
    options: [
      { name: 'קוטר 16 ס"מ', price: 130 },
      { name: 'קוטר 22 ס"מ', price: 200 }
    ]
  },

  // ==============================
  // 4. עוגיות
  // ==============================
  {
    name: 'מארז עוגיות בוטיק (כ-300 גרם)',
    description: 'חלבי. בחרו סוג אחד בהערות: רד ולווט ושוקולד לבן / שוקולד צ\'יפס / שוקולד מריר עם מלח גס / שוקולד צ\'יפס טבעוניות / מגולגלות נוטלה וקינדר.',
    category: 'עוגיות',
    basePrice: 38,
    minQuantity: 1
  },
  {
    name: 'מארז קוביות פינוק',
    description: 'חלבי (55 ₪). בחרו סוג בהערות: בלונדיז / בראוניז / בראוניז ללא גלוטן (לל"ג).',
    category: 'עוגיות',
    basePrice: 55,
    minQuantity: 1
  },
  {
    name: 'מארז אלפחורס (20 יחידות)',
    description: 'עוגיות אלפחורס ביתיות נמסות בפה במילוי ריבת חלב וקוקוס. חלבי.',
    category: 'עוגיות',
    basePrice: 55,
    minQuantity: 1
  },
  {
    name: 'מארז עוגיות פאי לימון (12 יחידות)',
    description: 'עוגיות אישיות עם קרם לימון חמצמץ ועשיר. חלבי.',
    category: 'עוגיות',
    basePrice: 55,
    minQuantity: 1
  },
  {
    name: 'עוגיית שוקולד צ\'יפס משפחתית (פאן-קוקי)',
    description: 'עוגיית ענק משפחתית, חלבית. ציינו בהערות האם תרצו חיתוך ל-6 או 8 חתיכות.',
    category: 'עוגיות',
    basePrice: 80,
    minQuantity: 1
  },
  {
    name: 'עוגייה ענקית - קינדר',
    description: 'עוגייה ענקית במילוי ושברי קינדר (חלב נוכרי). מינימום 2 יח\'.',
    category: 'עוגיות',
    basePrice: 14,
    minQuantity: 2
  },
  {
    name: 'עוגייה ענקית - לוטוס ושוקולד לבן',
    description: 'עוגייה ענקית עם ממרח לוטוס ושברי שוקולד לבן. חלבי. מינימום 2 יח\'.',
    category: 'עוגיות',
    basePrice: 14,
    minQuantity: 2
  },
  {
    name: 'עוגייה ענקית - שוקולד במילוי טראפלס',
    description: 'בצק שוקולד עשיר במילוי טראפלס שוקולד נמס. חלבי. מינימום 2 יח\'.',
    category: 'עוגיות',
    basePrice: 14,
    minQuantity: 2
  },
  {
    name: 'עוגייה ענקית - פיסטוק במילוי פיסטוק',
    description: 'עוגיית ענק עשירה בפיסטוק ובמילוי קרם פיסטוק איכותי. חלבי. מינימום 2 יח\'.',
    category: 'עוגיות',
    basePrice: 14,
    minQuantity: 2
  },
  {
    name: 'עוגייה ענקית - קונפטי ושוקולד לבן',
    description: 'עוגייה צבעונית משמחת עם שוקולד לבן מובחר. חלבי. מינימום 2 יח\'.',
    category: 'עוגיות',
    basePrice: 12,
    minQuantity: 2
  },
  {
    name: 'עוגייה ענקית - אוראו ושוקולד לבן',
    description: 'שילוב שברי אוראו ושוקולד לבן. חלבי. מינימום 2 יח\'.',
    category: 'עוגיות',
    basePrice: 12,
    minQuantity: 2
  },
  {
    name: 'עוגייה ענקית - שוקולד צ\'יפס קלאסית',
    description: 'עוגיית ענק נימוחה עם שפע נטיפי שוקולד איכותיים. חלבי. מינימום 2 יח\'.',
    category: 'עוגיות',
    basePrice: 12,
    minQuantity: 2
  },
  {
    name: 'עוגייה ענקית - אלפחורס',
    description: 'עוגיית ענק במילוי ריבת חלב וקוקוס. חלבי. מינימום 2 יח\'.',
    category: 'עוגיות',
    basePrice: 12,
    minQuantity: 2
  },

  // ==============================
  // 5. מארזים מתוקים
  // ==============================
  {
    name: 'מארז קינוחי כוסות (12 יחידות) - חלבי',
    description: '12 כוסות אישיות. בחרו עד 4 טעמים בהערות: קינדר, אוראו, פררו רושה, בייגלה מלוח, נוטלה, לוטוס, עוגת גבינה.',
    category: 'מארזים מתוקים',
    basePrice: 120,
    minQuantity: 1
  },
  {
    name: 'מארז קינוחי כוסות (12 יחידות) - פרווה',
    description: '12 כוסות אישיות. בחרו עד 3 טעמים בהערות: אוראו, לוטוס, שוקולד מריר עם ויסקי, חלבה.',
    category: 'מארזים מתוקים',
    basePrice: 120,
    minQuantity: 1
  },
  {
    name: 'מגש עוגיות בוטיק לאירוח',
    description: 'מגש מעוצב ומפנק עם מגוון עוגיות לבחירתכם. חלבי.',
    category: 'מארזים מתוקים',
    options: [
      { name: '3 סוגי עוגיות', price: 150 },
      { name: '4 סוגי עוגיות', price: 200 },
      { name: '5 סוגי עוגיות', price: 250 }
    ]
  },
  {
    name: 'מארז עוגה מרכזית + 5 סוגי עוגיות',
    description: 'מארז מושלם לאירוח עם עוגה מפנקת ומגוון עוגיות בוטיק. חלבי.',
    category: 'מארזים מתוקים',
    options: [
      { name: 'עם עוגת גבינה ושוקולד לבן', price: 210 },
      { name: 'עם עוגת פאדג\' שוקולד', price: 270 }
    ]
  },
  {
    name: 'מארז פינוקים עשיר (6-8 סועדים)',
    description: 'מארז עשיר ומפנק במיוחד עם מגוון קינוחים ופירות העונה הטריים. חלבי.',
    category: 'מארזים מתוקים',
    basePrice: 250,
    minQuantity: 1
  },
  {
    name: 'מארז מתוקים ללא גלוטן (לל"ג)',
    description: 'מבחר מתוקים ופינוקים ללא גלוטן.',
    category: 'מארזים מתוקים',
    basePrice: 110,
    minQuantity: 1
  },

  // ==============================
  // 6. מארזים מלוחים
  // ==============================
  {
    name: 'מארז ארוחה זוגית מפנקת',
    description: '2 שקשוקות, 4 פרעצלס, 4 ממרחים משתנים, סלט ביצים, סלט טונה, גבינות, זיתים, ירקות חתוכים ועוגיות לקינוח (לא כולל סכום).',
    category: 'מארזים מלוחים',
    options: [
      { name: 'ללא יין', price: 150 },
      { name: 'בתוספת בקבוק יין לבן', price: 190 }
    ]
  },
  {
    name: 'מארז ארוחה משפחתית (4-6 משתתפים)',
    description: 'לחם זיתים/פיצוחים, 4 שקשוקות אישיות, לזניה, 4 ממרחים משתנים, סלט ביצים, סלט טונה, גבינות, זיתים, ירקות חתוכים ועוגיות לקינוח (לא כולל סכום).',
    category: 'מארזים מלוחים',
    basePrice: 210,
    minQuantity: 1
  },
  {
    name: 'מארז כריכוני כוסמין (20 יחידות)',
    description: '20 לחמניות כוסמין. בחרו 4 מילויים בהערות: סביח, חביתה, סלט ביצים, סלט טונה, גבינה צהובה, גבינת שמנת וסלמון מעושן.',
    category: 'מארזים מלוחים',
    basePrice: 160,
    minQuantity: 1
  },
  {
    name: 'מארז 24 קישים אישיים',
    description: 'מגוון עשיר של 24 קישים אישיים בטעמי בטטה, בצל, ברוקולי ופטריות. חלבי.',
    category: 'מארזים מלוחים',
    basePrice: 165,
    minQuantity: 1
  },
  {
    name: 'מגש ירקות חתוכים עשיר',
    description: 'מגש ירקות שוק טריים, צבעוניים וחתוכים בקפידה.',
    category: 'מארזים מלוחים',
    options: [
      { name: 'ללא מטבל', price: 100 },
      { name: 'בתוספת מטבל ביתי', price: 115 }
    ]
  },
  {
    name: 'מרק עשיר ומחמם (2 ליטר)',
    description: 'מגיע עם קרוטונים/שקדי מרק לבחירתכם. בחרו טעם מרק בהערות: מרק כתום / מרק קישואים / מרק ברוקולי חלבי / מרק בצל חלבי.',
    category: 'מאפים מלוחים וסלטים',
    basePrice: 90,
    minQuantity: 1
  }
];
async function main() {
  console.log('מתחיל עדכון מוצרים במסד הנתונים...');

  // מחיקת כל המוצרים (מוחק אוטומטית גם את כל ה-ProductOptions בזכות onDelete: Cascade)
  await prisma.product.deleteMany({});
  console.log('מוצרים ישנים נמחקו בהצלחה.');

  for (const item of realProducts) {
    const { options, ...productData } = item;
    await prisma.product.create({
      data: {
        ...productData,
        ...(options && options.length > 0 && {
          options: {
            create: options
          }
        })
      }
    });
  }

  console.log('✅ כל המוצרים האמיתיים הוכנסו בהצלחה למסד הנתונים!');
}

main()
  .catch((e) => {
    console.error('שגיאה בהזנת המוצרים:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });