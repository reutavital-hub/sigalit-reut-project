import React, { useState, useEffect } from 'react';
import { CheckCircle, Trash2, X, PlusCircle, DollarSign, LogOut } from 'lucide-react';
import ProductsManagement from './ProductsManagement';

export default function AdminDashboard({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'dates' | 'products'
  const [orders, setOrders] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [products, setProducts] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  // מצבי אימות
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        fetchOrders();
        fetchBlockedDates();
        fetchProducts();
      } else {
        setLoginError(data.error || 'שם משתמש או סיסמה שגויים');
      }
    } catch (err) {
      setLoginError('שגיאת תקשורת עם השרת');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  // טעינת כל הנתונים בעת פתיחת המודאל
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchOrders();
      fetchBlockedDates();
      fetchProducts();
    }
  }, [isOpen, isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setOrders(await res.json());
      } else {
        console.error('Failed to fetch orders, status:', res.status);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/blocked-dates');
      if (res.ok) setBlockedDates(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  // פתיחת וואטסאפ עם הודעה מותאמת
  const openWhatsApp = (ord, customMessage = null) => {
    const rawPhone = ord.customerPhone || ord.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
    
    const text = customMessage || `היי ${ord.customerName}, ההזמנה שלך מוכנה! 🎂 מחכים לך באהבה.`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneWithCountry}?text=${encoded}`, '_blank');
  };

  // טיפול בלחיצה על "שולם"
  const handleTogglePaid = (ord) => {
    const isReady = ord.status === 'מוכן' || ord.status === 'הושלם ושולם';
    const isPaid = ord.status === 'שולם' || ord.status === 'הושלם ושולם';

    let nextStatus = '';
    if (!isPaid) {
      nextStatus = isReady ? 'הושלם ושולם' : 'שולם';
    } else {
      nextStatus = isReady ? 'מוכן' : 'ממתין לאישור';
    }

    handleUpdateOrderStatus(ord.id, nextStatus);
  };

  // טיפול בלחיצה על "מוכן" + פתיחה ישירה של וואטסאפ
  const handleToggleReady = (ord) => {
    const isReady = ord.status === 'מוכן' || ord.status === 'הושלם ושולם';
    const isPaid = ord.status === 'שולם' || ord.status === 'הושלם ושולם';

    let nextStatus = '';
    if (!isReady) {
      nextStatus = isPaid ? 'הושלם ושולם' : 'מוכן';
      openWhatsApp(ord, `שלום ${ord.customerName}, ההזמנה שלך מוכנה לאיסוף!
סה"כ לתשלום: ₪${ord.totalAmount}.
מחכים לך!`);
    } else {
      nextStatus = isPaid ? 'שולם' : 'ממתין לאישור';
    }

    handleUpdateOrderStatus(ord.id, nextStatus);
  };

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!newDate) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/blocked-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: newDate, reason: newReason })
      });
      if (res.ok) {
        setNewDate('');
        setNewReason('');
        fetchBlockedDates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBlockedDate = async (date) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/blocked-dates/${date}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setBlockedDates(blockedDates.filter(b => b.date !== date));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  // אם המשתמש אינו מחובר – מוצג טופס התחברות
  if (!isAuthenticated) {
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1rem'
      }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', width: '100%', maxWidth: '380px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>כניסת מנהל מערכת</h3>
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          
          {loginError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{loginError}</p>}
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>שם משתמש</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>סיסמה</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <button
              type="submit"
              style={{ backgroundColor: '#d19e61', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem' }}
            >
              התחבר למערכת
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(ord => ord.status !== 'הושלם ושולם');

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '14px', width: '100%', maxWidth: '900px',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* כותרת עליונה */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>ניהול עסק ומאפייה</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button
              onClick={handleLogout}
              title="התנתק"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                border: 'none', background: '#f1f5f9', color: '#64748b',
                padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
              }}
            >
              <LogOut size={16} /> התנתק
            </button>
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* לשוניות */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              flex: 1, padding: '0.85rem', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === 'orders' ? '700' : '500',
              borderBottom: activeTab === 'orders' ? '3px solid #14b8a6' : 'none',
              backgroundColor: activeTab === 'orders' ? '#fff' : 'transparent',
              color: activeTab === 'orders' ? '#0f766e' : '#64748b'
            }}
          >
            מעקב הזמנות פעילות ({activeOrders.length})
          </button>
          
          <button
            onClick={() => setActiveTab('dates')}
            style={{
              flex: 1, padding: '0.85rem', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === 'dates' ? '700' : '500',
              borderBottom: activeTab === 'dates' ? '3px solid #14b8a6' : 'none',
              backgroundColor: activeTab === 'dates' ? '#fff' : 'transparent',
              color: activeTab === 'dates' ? '#0f766e' : '#64748b'
            }}
          >
            חסימת ופתיחת תאריכים ({blockedDates.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            style={{
              flex: 1, padding: '0.85rem', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === 'products' ? '700' : '500',
              borderBottom: activeTab === 'products' ? '3px solid #14b8a6' : 'none',
              backgroundColor: activeTab === 'products' ? '#fff' : 'transparent',
              color: activeTab === 'products' ? '#0f766e' : '#64748b'
            }}
          >
            ניהול קטלוג מוצרים ({products.length})
          </button>
        </div>

        {/* תוכן הלשוניות */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          
          {/* לשונית 1: הזמנות */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeOrders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
                  אין הזמנות פתוחות לטיפול כרגע 🎉
                </p>
              ) : (
                activeOrders.map((ord) => {
                  const isPaid = ord.status === 'שולם' || ord.status === 'הושלם ושולם';
                  const isReady = ord.status === 'מוכן' || ord.status === 'הושלם ושולם';

                  return (
                    <div key={ord.id} style={{
                      border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem',
                      backgroundColor: '#ffffff',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>{ord.customerName}</span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{ord.customerPhone || ord.phone}</span>
                          
                          {isPaid && (
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '600' }}>
                              שולם ✓
                            </span>
                          )}
                          {isReady && (
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: '600' }}>
                              מוכן ✓
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.3rem' }}>
                          תאריך יעד: <strong>{ord.deliveryDate || 'לא צוין'}</strong> | שעה: <strong>{ord.deliveryTime || ''}</strong> | סה"כ: ₪{ord.totalAmount}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleTogglePaid(ord)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.5rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
                            border: isPaid ? 'none' : '1px solid #d19e61',
                            backgroundColor: isPaid ? '#d19e61' : '#fdfaf5',
                            color: isPaid ? '#ffffff' : '#d19e61',
                            fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s'
                          }}
                        >
                          <DollarSign size={16} /> {isPaid ? 'שולם ✓' : 'סמן ששולם'}
                        </button>

                        <button
                          onClick={() => handleToggleReady(ord)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.5rem 0.9rem', borderRadius: '8px', cursor: 'pointer', border: 'none',
                            backgroundColor: isReady ? '#22c55e' : '#e2e8f0',
                            color: isReady ? '#fff' : '#334155',
                            fontWeight: '600', fontSize: '0.85rem'
                          }}
                        >
                          <CheckCircle size={16} />
                          {isReady ? 'מוכן (נשלח בוואטסאפ) ✓' : 'מוכן + הודעת וואטסאפ'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* לשונית 2: חסימת תאריכים */}
          {activeTab === 'dates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <form onSubmit={handleAddBlockedDate} style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
                backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                    תאריך לחסימה:
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ flex: 1.5 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                    סיבה (אופציונלי):
                  </label>
                  <input
                    type="text"
                    placeholder="למשל: תפוסה מלאה / חופשה"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px',
                    padding: '0.55rem 1.2rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                  }}
                >
                  <PlusCircle size={16} /> חסום תאריך
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#475569' }}>תאריכים סגורים כעת:</h4>
                {blockedDates.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>אין תאריכים חסומים כרגע.</p>
                ) : (
                  blockedDates.map(b => (
                    <div key={b.id || b.date} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.65rem 1rem', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', borderRadius: '8px'
                    }}>
                      <div>
                        <strong>{b.date}</strong> — <span style={{ color: '#991b1b', fontSize: '0.85rem' }}>{b.reason}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteBlockedDate(b.date)}
                        title="פתח תאריך מחדש"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* לשונית 3: ניהול מוצרים */}
          {activeTab === 'products' && (
            <ProductsManagement 
              products={products} 
              onRefresh={fetchProducts} 
            />
          )}

        </div>
      </div>
    </div>
  );
}