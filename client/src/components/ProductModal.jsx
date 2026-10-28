import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  // אם יש אופציות (גדלים/גרסאות), נבחר כברירת מחדל את הראשונה
  const hasOptions = product.options && product.options.length > 0;
  const [selectedOption, setSelectedOption] = useState(hasOptions ? product.options[0] : null);

  // כמות: אם יש מינימום מוגדר נתחיל ממנו, אחרת נתחיל מ-1
  const initialQty = product.minQuantity ? product.minQuantity : 1;
  const [quantity, setQuantity] = useState(initialQty);
  const minQty = product.minQuantity || 1;

  // הערות מיוחדות למוצר (למשל: "בלי אגוזים", "ברכה על העוגה")
  const [notes, setNotes] = useState('');

  // חישוב מחיר ליחידה
  const unitPrice = selectedOption ? selectedOption.price : (product.basePrice || 0);
  const totalPrice = unitPrice * quantity;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => {
    if (quantity > minQty) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleConfirm = () => {
    const itemToAdd = {
      productId: product.id,
      name: product.name,
      image: product.image,
      selectedOption: selectedOption ? selectedOption.name : null,
      unitPrice,
      quantity,
      totalPrice,
      notes: notes.trim()
    };
    onAddToCart(itemToAdd);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(36, 51, 57, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* כפתור סגירה */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(255,255,255,0.85)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <X size={20} color="var(--dark-slate)" />
        </button>

        {/* תמונת המוצר */}
        {product.image && (
          <div style={{ width: '100%', height: '200px', backgroundColor: '#f1f5f9' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-teal)', fontWeight: '700' }}>
              {product.category}
            </span>
            <h2 className="font-title" style={{ margin: '0.2rem 0 0.4rem 0', fontSize: '1.5rem', color: 'var(--dark-slate)' }}>
              {product.name}
            </h2>
            {product.description && (
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {product.description}
              </p>
            )}
          </div>

          {/* בחירת גודל / אפשרות אם קיימת */}
          {hasOptions && (
            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                בחירת גודל / גרסה:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {product.options.map((opt) => {
                  const isSelected = selectedOption?.id === opt.id || selectedOption?.name === opt.name;
                  return (
                    <div
                      key={opt.id || opt.name}
                      onClick={() => setSelectedOption(opt)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary-teal)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? '#f0f9f9' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '5px solid var(--primary-teal)' : '2px solid var(--border-color)',
                          backgroundColor: '#ffffff'
                        }} />
                        <span style={{ fontWeight: isSelected ? '700' : '500' }}>{opt.name}</span>
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--dark-slate)' }}>₪{opt.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* בחירת כמות */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: '700', fontSize: '0.95rem' }}>כמות:</label>
              {product.minQuantity > 1 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-caramel)', fontWeight: '600' }}>
                  מינימום להזמנה: {product.minQuantity} יחידות
                </span>
              )}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              backgroundColor: '#f8fafc',
              padding: '0.5rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= minQty}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: quantity <= minQty ? '#e2e8f0' : '#ffffff',
                  cursor: quantity <= minQty ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Minus size={16} />
              </button>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', minWidth: '30px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* הערות להזמנה */}
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
              הערות או בקשות מיוחדות:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="למשל: כיתוב על העוגה, אריזת מתנה..."
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* כפתור אישור והוספה לסל */}
          <button
            onClick={handleConfirm}
            style={{
              backgroundColor: 'var(--primary-teal)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.85rem',
              fontSize: '1.05rem',
              fontWeight: '700',
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              boxShadow: '0 4px 10px rgba(30, 164, 168, 0.25)'
            }}
          >
            <span>הוספה לסל</span>
            <span>₪{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}