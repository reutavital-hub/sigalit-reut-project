import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle, Trash2, X, PlusCircle } from 'lucide-react';

export default function AdminDashboard({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'dates'
  const [orders, setOrders] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
      fetchBlockedDates();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      if (res.ok) setOrders(await res.json());
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

  const handleToggleOrderStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!newDate) return;
    try {
      const res = await fetch('http://localhost:5000/api/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`http://localhost:5000/api/blocked-dates/${date}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setBlockedDates(blockedDates.filter(b => b.date !== date));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '14px', width: '100%', maxWidth: '850px',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>ניהול עסק ואפייה</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Buttons */}
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
            מעקב הזמנות ({orders.length})
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
        </div>

        {/* Content Area */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'orders' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8' }}>אין הזמנות במסד עדיין.</p>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} style={{
                    border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem',
                    backgroundColor: ord.status === 'COMPLETED' ? '#f0fdf4' : '#ffffff',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>{ord.customerName}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{ord.phone}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.3rem' }}>
                        תאריך יעד: <strong>{ord.deliveryDate || 'לא צוין'}</strong> | סה"כ: ₪{ord.totalAmount}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleOrderStatus(ord.id, ord.status)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 0.9rem', borderRadius: '8px', cursor: 'pointer', border: 'none',
                        backgroundColor: ord.status === 'COMPLETED' ? '#22c55e' : '#e2e8f0',
                        color: ord.status === 'COMPLETED' ? '#fff' : '#334155',
                        fontWeight: '600', fontSize: '0.85rem'
                      }}
                    >
                      <CheckCircle size={16} />
                      {ord.status === 'COMPLETED' ? 'הושלם' : 'סמן כבוצע'}
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* טופס חסימת תאריך */}
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

              {/* רשימת תאריכים חסומים */}
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
        </div>
      </div>
    </div>
  );
}