import React, { useState } from 'react';
import { Search, Plus, Trash2, RotateCcw, Edit2, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sigalit-reut-project.onrender.com';

// פונקציית עזר לשליפת מחיר המוצר מכל שדה אפשרי במסד הנתונים
const getProductPrice = (product) => {
  if (!product) return 0;
  if (product.price !== undefined && product.price !== null && product.price !== '') {
    return Number(product.price);
  }
  if (product.basePrice !== undefined && product.basePrice !== null && product.basePrice !== '') {
    return Number(product.basePrice);
  }
  if (Array.isArray(product.options) && product.options.length > 0 && product.options[0].price !== undefined) {
    return Number(product.options[0].price);
  }
  return 0;
};

export default function ProductsManagement({ products = [], onRefresh }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [recentlyEditedId, setRecentlyEditedId] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'עוגיות ענקיות',
    price: '',
    imageUrl: '',
    description: '',
  });

  const token = localStorage.getItem('adminToken');

  const showToast = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // פתיחת מודאל עריכה עם מחיר וקטגוריה מאותחלים כראוי
  const openEditModal = (product) => {
    setEditingProduct({
      ...product,
      price: getProductPrice(product),
      category: product.category || 'עוגיות ענקיות',
      imageUrl: product.imageUrl || ''
    });
  };

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

      if (res.ok && onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Error toggling product status:', err);
    }
  };

  // שמירת עריכת מוצר (מחיר, שם, תמונה, קטגוריה)
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);

    const payload = {
      name: editingProduct.name,
      category: editingProduct.category,
      price: Number(editingProduct.price),
      basePrice: Number(editingProduct.price),
      imageUrl: editingProduct.imageUrl
    };

    try {
      // ניסיון ראשון עם PATCH
      let res = await fetch(`${API_BASE_URL}/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // אם השרת מוגדר לקבל PUT במקום PATCH, ננסה אוטומטית PUT
      if (res.status === 404 || res.status === 405) {
        res = await fetch(`${API_BASE_URL}/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `שגיאת שרת (${res.status}) בעדכון המוצר`);
      }

      const updatedId = editingProduct.id;
      const updatedName = editingProduct.name;

      // סגירת החלון מיד, רענון הרשימה בחוץ והצגת חיווי ברור
      setEditingProduct(null);
      setRecentlyEditedId(updatedId);
      if (onRefresh) await onRefresh();
      showToast(`המוצר "${updatedName}" עודכן בהצלחה!`);

      setTimeout(() => setRecentlyEditedId(null), 6000);
    } catch (err) {
      console.error('Error updating product:', err);
      alert(`לא ניתן לשמור את השינויים: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // יצירת מוצר חדש
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
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
          basePrice: Number(newProduct.price),
          selectionType: 'single',
          options: []
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `שגיאת שרת (${res.status}) בהוספת המוצר`);
      }

      const createdName = newProduct.name;
      setIsAddModalOpen(false);
      setNewProduct({ name: '', category: 'עוגיות ענקיות', price: '', imageUrl: '', description: '' });
      if (onRefresh) await onRefresh();
      showToast(`המוצר "${createdName}" נוסף לקטלוג!`);
    } catch (err) {
      console.error('Error adding product:', err);
      alert(`שגיאה בהוספת מוצר: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const baseCategories = [
    'עוגיות ענקיות',
    'עוגות מעוצבות',
    'מארזי קינוחים',
    'מאפים',
    'לחמים וממרחים'
  ];

  // מוודא שאם למוצר יש קטגוריה מיוחדת קיימת, היא תופיע ברשימה ולא תידרס
  const editCategories = editingProduct && editingProduct.category && !baseCategories.includes(editingProduct.category)
    ? [editingProduct.category, ...baseCategories]
    : baseCategories;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* הודעת אישור לאחר שמירה */}
      {feedbackMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#dcfce7',
          color: '#166534',
          border: '1px solid #86efac',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

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

      {/* תצוגת כרטיסיות מוצרים */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', backgroundColor: '#fff', borderRadius: '10px' }}>
          לא נמצאו מוצרים.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {filteredProducts.map((product) => {
            const displayPrice = getProductPrice(product);
            const isJustUpdated = recentlyEditedId === product.id;

            return (
              <div
                key={product.id}
                style={{
                  backgroundColor: product.isActive ? '#fff' : '#f8fafc',
                  border: isJustUpdated ? '2px solid #22c55e' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: product.isActive ? 1 : 0.75,
                  transition: 'border 0.3s ease'
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', gap: '4px', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', color: '#475569' }}>
                      {product.category || 'כללי'}
                    </span>
                    {isJustUpdated && (
                      <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                        עודכן ✓
                      </span>
                    )}
                    {!product.isActive && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>מושבת</span>
                    )}
                  </div>

                  {/* שם ומחיר */}
                  <h4 style={{ margin: '0 0 0.3rem 0', color: '#1e293b', fontSize: '1rem' }}>{product.name}</h4>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#d19e61', marginBottom: '0.8rem' }}>
                    ₪{displayPrice}
                  </div>
                </div>

                {/* כפתורי פעולה */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    onClick={() => openEditModal(product)}
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
            );
          })}
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
                  {editCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>מחיר (₪)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
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
                  disabled={isSaving}
                  onClick={() => setEditingProduct(null)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: '0.5rem 1.2rem', borderRadius: '6px', border: 'none', background: '#d19e61', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isSaving ? 'שומר...' : 'שמור שינויים'}
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
                  {baseCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>מחיר (₪)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
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
                  disabled={isSaving}
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: '0.5rem 1.2rem', borderRadius: '6px', border: 'none', background: '#d19e61', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isSaving ? 'מוסיף...' : 'הוסף מוצר'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}