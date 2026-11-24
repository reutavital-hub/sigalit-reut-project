import React from 'react';

export default function ProductCard({ product, onSelectProduct }) {
  // חישוב מחיר תצוגה
  const displayPrice = product.basePrice 
    ? `₪${product.basePrice}`
    : product.options?.length > 0 
      ? `החל מ-₪${Math.min(...product.options.map(o => o.price))}`
      : 'לפי בחירה';

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      {/* תמונה */}
      <div 
        className="product-card-img"
        style={{
          backgroundColor: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>תמונה בקרוב</span>
        )}
      </div>

      {/* פרטי המוצר */}
      <div className="product-card-body" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <span style={{
          fontSize: '0.78rem',
          color: 'var(--primary-teal)',
          fontWeight: '700',
          marginBottom: '0.25rem'
        }}>
          {product.category}
        </span>
        <h3 className="font-title product-card-title" style={{ color: 'var(--dark-slate)' }}>
          {product.name}
        </h3>
        {product.description && (
          <p className="product-card-desc" style={{
            color: 'var(--text-muted)',
            flexGrow: 1
          }}>
            {product.description}
          </p>
        )}

        <div className="product-card-footer" style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-color)'
        }}>
          <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--dark-slate)' }}>
            {displayPrice}
          </span>
          <button
            className="product-card-btn"
            onClick={() => onSelectProduct(product)}
            style={{
              backgroundColor: 'var(--primary-teal)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-teal-dark)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-teal)'}
          >
            הוספה לסל
          </button>
        </div>
      </div>
    </div>
  );
}