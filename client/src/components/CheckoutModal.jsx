import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlertCircle, ShoppingBag } from 'lucide-react';

const BUSINESS_PHONE = '972543979760'; // החליפי במספר הוואטסאפ המלא שלך ללא +

export default function CheckoutModal({ isOpen, onClose, cart = [], totalAmount = 0, onOrderSuccess }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup'); // 'pickup' | 'delivery'
  const [address, setAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('morning'); // 'morning' | 'evening'
  const [preferredTime, setPreferredTime] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockedDatesList, setBlockedDatesList] = useState([]);

  // טעינת רשימת התאריכים החסומים בכל פתיחה
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      fetch('http://localhost:5000/api/blocked-dates')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBlockedDatesList(data);
          }
        })
        .catch(err => console.error('שגיאה בטעינת תאריכים חסומים:', err));
    }
  }, [isOpen]);

  // חישוב תאריך מינימום (3 ימים קדימה)
  const getMinDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatHebrewDate = (dateVal) => {
    if (!dateVal) return '';
    const [y, m, d] = dateVal.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });
  };

  const validateChosenDate = (dateVal) => {
    if (!dateVal) return 'יש לבחור תאריך אספקה';

    // בדיקת תאריך חסום
    const blockedEntry = blockedDatesList.find(b => b.date === dateVal);
    if (blockedEntry) {
      return `התאריך שנבחר סגור לקבלת הזמנות (${blockedEntry.reason || 'תפוסה מלאה'}). אנא בחרו תאריך אחר.`;
    }

    const [y, m, d] = dateVal.split('-').map(Number);
    const chosen = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffDays = Math.round((chosen.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 3) {
      return 'יש להזמין לפחות 3 ימים מראש';
    }

    const dayOfWeek = chosen.getDay(); // 5 = שישי, 6 = שבת
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      const currentDay = now.getDay(); // 3 = רביעי
      const currentHour = now.getHours();

      if (diffDays <= 6) {
        if (currentDay > 3 || (currentDay === 3 && currentHour >= 13)) {
          return 'הזמנות לסוף השבוע הקרוב נסגרות בכל יום רביעי בשעה 13:00. ניתן להזמין לסופ"ש הבא.';
        }
      }
    }

    return null;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('נא למלא שם ומספר טלפון');
      return;
    }

    if (deliveryMethod === 'delivery' && !address.trim()) {
      setErrorMsg('נא להזין כתובת מלאה למשלוח');
      return;
    }

    const dateError = validateChosenDate(selectedDate);
    if (dateError) {
      setErrorMsg(dateError);
      return;
    }

    setIsSubmitting(true);
const calculatedTotal = cart.reduce((sum, it) => {
      const p = Number(it.unitPrice ?? it.price ?? it.selectedOption?.price ?? it.basePrice ?? 0);
      return sum + (p * (Number(it.quantity) || 1));
    }, 0);

    const finalTotal = totalAmount > 0 ? totalAmount : calculatedTotal;
    const timeSlotLabel = timeSlot === 'morning' ? 'בוקר' : 'אחר הצהריים / ערב';
    const exactTimeText = preferredTime ? ` (שעה מבוקשת: ${preferredTime})` : '';
    const formattedDate = formatHebrewDate(selectedDate);

    // 1. שמירת ההזמנה במסד הנתונים
    // try {
    //   const orderPayload = {
    //     customerName: fullName,
    //     phone,
    //     deliveryDate: formattedDate,
    //     deliveryTime: `${timeSlotLabel}${exactTimeText}`,
    //     notes: [
    //       deliveryMethod === 'delivery' ? `משלוח לכתובת: ${address}` : 'איסוף עצמי מלוד',
    //       deliveryNotes ? `הערות: ${deliveryNotes}` : ''
    //     ].filter(Boolean).join(' | '),
    //     totalAmount,
    //     items: cart.map(it => ({
    //       productId: it.id,
    //       selectedOptionId: it.selectedOptionId || (typeof it.selectedOption === 'object' ? it.selectedOption?.id : null),
    //       quantity: it.quantity,
    //       price: it.unitPrice || it.price || 0,
    //       notes: it.notes || ''
    //     }))
    //   };

    //   await fetch('http://localhost:5000/api/orders', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(orderPayload)
    //   });
    // } catch (apiErr) {
    //   console.warn('שגיאה בשמירת הזמנה במסד, ממשיכים לשליחה בוואטסאפ:', apiErr);
    // }

    const orderPayload = {
      customerName: fullName.trim(),
      customerPhone: phone.trim(),
      deliveryType: deliveryMethod, // 'pickup' או 'delivery'
      deliveryAddress: deliveryMethod === 'delivery' ? address.trim() : null,
      deliveryDate: formattedDate,
      deliveryTime: `${timeSlotLabel}${exactTimeText}`,
      isGift: false,
      recipientName: null,
      recipientPhone: null,
      recipientAddress: null,
      greetingCard: null,
      notes: deliveryNotes.trim() || null,
      totalAmount: finalTotal,
      items: cart.map(it => {
        const itemPrice = Number(it.unitPrice ?? it.price ?? it.selectedOption?.price ?? it.basePrice ?? 0);
        return {
          productId: it.productId || it.id,
          productOptionId: it.productOptionId || (typeof it.selectedOption === 'object' ? it.selectedOption?.id : null),
          quantity: Number(it.quantity) || 1,
          unitPrice: itemPrice
        };
      })
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('שגיאה ביצירת הזמנה מהשרת:', errJson);
      } else {
        const result = await res.json();
        console.log('ההזמנה נשמרה בנאון בהצלחה:', result);
      }
    } catch (netErr) {
      console.error('שגיאת תקשורת עם השרת:', netErr);
    }

    // 2. בניית הודעת וואטסאפ
    let waText = `*הזמנה חדשה מהאתר - רעות אביטל*\n`;
    waText += `*שם המזמין/ה:* ${fullName}\n`;
    waText += `*טלפון:* ${phone}\n`;
    waText += `*תאריך מבוקש:* ${formattedDate}\n`;
    waText += `*זמן מבוקש:* ${timeSlotLabel}${exactTimeText}\n`;
    waText += `*אופן קבלה:* ${deliveryMethod === 'delivery' ? `משלוח לכתובת: ${address}` : 'איסוף עצמי מלוד'}\n`;
    if (deliveryNotes) waText += `*הערות:* ${deliveryNotes}\n`;
    waText += `\n*פירוט פריטים:*\n`;
    cart.forEach((it, idx) => {
      const optName = typeof it.selectedOption === 'object' ? it.selectedOption?.name : it.selectedOption;
      const itemPrice = Number(it.unitPrice ?? it.price ?? it.selectedOption?.price ?? it.basePrice ?? 0);
      waText += `${idx + 1}. ${it.name} ${optName ? `(${optName})` : ''} x${it.quantity} - ₪${(it.unitPrice || it.price || 0) * it.quantity}\n`;
      if (it.notes) waText += `   הערה: ${it.notes}\n`;
    });
    waText += `\n*סה"כ לתשלום:* ₪${totalAmount}`;

    // const waUrl = `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(waText)}`;
    // window.open(waUrl, '_blank');

window.open(`https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(waText)}`, '_blank');

    if (onOrderSuccess) {
      onOrderSuccess({
        fullName,
        phone,
        selectedDate: formattedDate,
        timeSlot: `${timeSlotLabel}${exactTimeText}`,
        deliveryMethod,
        address,
        cart,
        totalAmount:finalTotal
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '14px', width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        {/* כותרת וסגירה */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>פרטי הזמנה ותיאום</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c',
            padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.2rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* פרטים אישיים */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>שם מלא *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>טלפון נייד *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="050-0000000"
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          {/* אופן קבלה */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>אופן קבלה</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={() => setDeliveryMethod('pickup')}
                />
                איסוף עצמי מלוד
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="delivery"
                  checked={deliveryMethod === 'delivery'}
                  onChange={() => setDeliveryMethod('delivery')}
                />
                משלוח (בתיאום)
              </label>
            </div>
          </div>

          {deliveryMethod === 'delivery' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>כתובת מלאה למשלוח *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="עיר, רחוב, מספר בית ודירה"
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          )}

          {/* תאריך אספקה */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>תאריך אספקה מבוקש *</label>
            <input
              type="date"
              required
              min={getMinDateString()}
              value={selectedDate}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDate(val);
                const err = validateChosenDate(val);
                if (err) setErrorMsg(err);
                else setErrorMsg('');
              }}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            <small style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', marginTop: '0.2rem' }}>
              הזמנות יש לבצע לפחות 3 ימים מראש (הזמנות לסופ"ש נסגרות ברביעי ב-13:00)
            </small>
          </div>

          {/* שעות אספקה */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>טווח זמנים</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="morning">בוקר (09:00 - 13:00)</option>
                <option value="evening">אחה"צ / ערב (16:00 - 20:00)</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>שעה משוערת</label>
              <input
                type="text"
                placeholder="למשל: 10:30"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>הערות ובקשות מיוחדות</label>
            <textarea
              rows="2"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="אלרגיות, קומה/כניסה, ברכה..."
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
            />
          </div>

          {/* סיכום וכפתור שליחה */}
          <div style={{
            borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>סה"כ לתשלום:</span>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f766e' }}>₪{totalAmount}</div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '8px',
                padding: '0.75rem 1.4rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <span>{isSubmitting ? 'שולח...' : 'שליחת הזמנה בוואטסאפ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}