import React, { useState } from 'react';
import { Search, Plus, Trash2, RotateCcw, Edit2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductsManagement({ products = [], onRefresh }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'עוגיות ענקיות',
    price: '',
    imageUrl: '',
    description: '',
  });

  const token = localStorage.getItem('adminToken');

  // סינון מוצרים לפי שורת החיפוש
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(globalFilter.toLowerCase()))
  );

  // השבתה או החזרה של מוצר לאתר
  const handleToggleProductActive = async (product) => {
    try {
      const endpoint = product.isActive
        ? `${API_BASE_URL}/api/products/${product.id}`
        : `${API_BASE_URL}/api/products/${product.id}/restore`;

      const method = product.isActive ? 'DELETE' : 'PATCH';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Error toggling product status:', err);
    }
  };

  // שמירת עריכת מוצר (מחיר, שם, תמונה, קטגוריה)
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingProduct.name,
          category: editingProduct.category,
          price: Number(editingProduct.price),
          imageUrl: editingProduct.imageUrl
        })
      });

      if (res.ok) {
        setEditingProduct(null);
        onRefresh();
      }
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  // יצירת מוצר חדש
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          selectionType: 'single',
          options: []
        })
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewProduct({ name: '', category: 'עוגיות ענקיות', price: '', imageUrl: '', description: '' });
        onRefresh();
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* סרגל עליון - חיפוש וכפתור הוספה */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="חיפוש מוצר בקטלוג..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 2.2rem 0.55rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#d19e61',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1.1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> מוצר חדש
        </button>
      </div>

      {/* תצוגת כרטיסיות מוצרים במקום טבלה */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', backgroundColor: '#fff', borderRadius: '10px' }}>
          לא נמצאו מוצרים.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                backgroundColor: product.isActive ? '#fff' : '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: product.isActive ? 1 : 0.75
              }}
            >
              <div>
                {/* תמונה */}
                <div style={{ width: '100%', height: '130px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>אין תמונה</span>
                  )}
                </div>

                {/* קטגוריה וסטטוס */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', color: '#475569' }}>
                    {product.category || 'כללי'}
                  </span>
                  {!product.isActive && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>מושבת</span>
                  )}
                </div>

                {/* שם ומחיר */}
                <h4 style={{ margin: '0 0 0.3rem 0', color: '#1e293b', fontSize: '1rem' }}>{product.name}</h4>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#d19e61', marginBottom: '0.8rem' }}>
                  ₪{product.price}
                </div>
              </div>

              {/* כפתורי פעולה */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button
                  onClick={() => setEditingProduct(product)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '6px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#fff',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={13} /> ערוך
                </button>

                <button
                  onClick={() => handleToggleProductActive(product)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '6px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: product.isActive ? '#fee2e2' : '#ecfdf5',
                    color: product.isActive ? '#b91c1c' : '#047857',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {product.isActive ? <><Trash2 size={13} /> השבת</> : <><RotateCcw size={13} /> החזר</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* מודאל עריכת מוצר קיים */}
      {editingProduct && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '1.5rem', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>עריכת מוצר: {editingProduct.name}</h3>
            <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>שם המוצר</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>קטגוריה</label>
                <select
                  value={editingProduct.category || 'עוגיות ענקיות'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="עוגיות ענקיות">עוגיות ענקיות</option>
                  <option value="עוגות מעוצבות">עוגות מעוצבות</option>
                  <option value="מארזי קינוחים">מארזי קינוחים</option>
                  <option value="מאפים">מאפים</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>מחיר (₪)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>קישור לתמונה</label>
                <input
                  type="text"
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.2rem', borderRadius: '6px', border: 'none', background: '#d19e61', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  שמור שינויים
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* מודאל הוספת מוצר */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '1.5rem', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>הוספת מוצר חדש לקטלוג</h3>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>שם המוצר</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>קטגוריה</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="עוגיות ענקיות">עוגיות ענקיות</option>
                  <option value="עוגות מעוצבות">עוגות מעוצבות</option>
                  <option value="מארזי קינוחים">מארזי קינוחים</option>
                  <option value="מאפים">מאפים</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>מחיר (₪)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>קישור לתמונה (נתיב או URL)</label>
                <input
                  type="text"
                  placeholder="למשל: /product/my_cookie.jpg"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.2rem', borderRadius: '6px', border: 'none', background: '#d19e61', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  הוסף מוצר
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}