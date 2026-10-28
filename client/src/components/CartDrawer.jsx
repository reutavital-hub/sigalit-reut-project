import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onProceedToCheckout }) {
  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(36, 51, 57, 0.6)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-start', // בצד שמאל כמקובל בעברית/RTL
      transition: 'opacity 0.3s ease'
    }}>
      {/* רקע שקוף שלחיצה עליו סוגרת */}
      <div 
        onClick={onClose} 
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} 
      />

      {/* גוף המגירה */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        zIndex: 1001
      }}>
        {/* כותרת המגירה */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={22} color="var(--primary-teal)" />
            <h3 className="font-title" style={{ margin: 0, fontSize: '1.35rem', color: 'var(--dark-slate)' }}>
              סל ההזמנות שלי
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ({cart.length} פריטים)
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%'
            }}
          >
            <X size={22} color="var(--dark-slate)" />
          </button>
        </div>

        {/* רשימת המוצרים בסל */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{
              textAlign: 'center',
              paddingTop: '4rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <ShoppingBag size={48} strokeWidth={1.2} style={{ marginBottom: '1rem', color: 'var(--border-color)' }} />
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>הסל שלך עדיין ריק</p>
              <span style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>בחרי משהו טעים מהתפריט שלנו!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  style={{
                    display: 'flex',
                    gap: '0.85rem',
                    padding: '0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    backgroundColor: '#fafafa'
                  }}
                >
                  {/* תמונת הפריט אם קיימת */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  )}

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--dark-slate)' }}>{item.name}</h4>
                        {item.selectedOption && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', fontWeight: '600' }}>
                            {item.selectedOption}
                          </span>
                        )}
                        {item.notes && (
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            הערה: {item.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveItem(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          color: '#ef4444'
                        }}
                        title="הסר פריט"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      {/* שינוי כמות */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '0.15rem 0.4rem'
                      }}>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '16px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--dark-slate)' }}>
                        ₪{item.unitPrice * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* תחתית המגירה: סיכום וכפתור מעבר להזמנה */}
        {cart.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: '#ffffff'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              fontSize: '1.15rem'
            }}>
              <span style={{ fontWeight: '600', color: 'var(--dark-slate)' }}>סה"כ לתשלום:</span>
              <span className="font-title" style={{ fontSize: '1.4rem', color: 'var(--primary-teal)', fontWeight: 'bold' }}>
                ₪{totalAmount}
              </span>
            </div>

            <button
              onClick={onProceedToCheckout}
              style={{
                width: '100%',
                backgroundColor: 'var(--primary-teal)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.9rem',
                fontSize: '1.05rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 10px rgba(30, 164, 168, 0.25)'
              }}
            >
              <span>המשך לפרטי הזמנה</span>
              <ArrowLeft size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}