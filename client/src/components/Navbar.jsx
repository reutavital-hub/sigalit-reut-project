import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Navbar({ cartCount = 0, onOpenCart }) {
  return (
    <header style={{
      backgroundColor: 'var(--primary-teal)',
      color: '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 10px rgba(30, 164, 168, 0.2)',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* לוגו מוגדל ושם העסק */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <img 
            src="/logo.png" 
            alt="רעות אביטל" 
            style={{ 
              width: '64px',            /* הגדלנו מ-48px ל-64px */
              height: '64px',
              borderRadius: '50%', 
              objectFit: 'cover',
              backgroundColor: '#ffffff',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              display: 'block',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }} 
          />
          <div>
            <h1 className="font-title" style={{
              margin: 0,
              fontSize: '1.75rem',
              lineHeight: 1.1,
              color: '#ffffff'
            }}>
              רעות אביטל
            </h1>
            <p style={{
              margin: '3px 0 0 0',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.95)',
              letterSpacing: '0.2px'
            }}>
              מתוק מלוח ומה שביניהם
            </p>
          </div>
        </div>

        {/* כפתור עגלה */}
        <button
          onClick={onOpenCart}
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '12px',
            cursor: 'pointer',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            color: '#ffffff'
          }}
          aria-label="עגלת קניות"
        >
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: 'var(--accent-caramel)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '9999px',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}