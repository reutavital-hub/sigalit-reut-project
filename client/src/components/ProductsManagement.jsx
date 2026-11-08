import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Search, Plus, Trash2, RotateCcw, Check, Edit2, X } from 'lucide-react';

export default function ProductsManagement({ products, onRefresh }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // נתוני מוצר חדש כולל שדה תמונה
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'עוגיות ענקיות',
    price: '',
    imageUrl: '',
    description: '',
  });

  const token = localStorage.getItem('adminToken');

  const handleToggleProductActive = async (product) => {
    try {
      const endpoint = product.isActive 
        ? `http://localhost:5000/api/products/${product.id}` 
        : `http://localhost:5000/api/products/${product.id}/restore`;
      
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

  const handleSavePrice = async (productId) => {
    if (newPrice === '' || isNaN(newPrice)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ price: Number(newPrice) })
      });

      if (res.ok) {
        setEditingPriceId(null);
        setNewPrice('');
        onRefresh();
      }
    } catch (err) {
      console.error('Error updating price:', err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/products', {
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

  const columns = useMemo(() => [
    {
      header: 'תמונה',
      accessorKey: 'imageUrl',
      cell: ({ row }) => (
        <div style={{ width: '45px', height: '45px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {row.original.imageUrl ? (
            <img src={row.original.imageUrl} alt={row.original.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>אין</span>
          )}
        </div>
      ),
    },
    {
      header: 'שם המוצר',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <strong style={{ color: row.original.isActive ? '#1e293b' : '#94a3b8' }}>
            {row.original.name}
          </strong>
          {!row.original.isActive && (
            <span style={{ fontSize: '0.75rem', marginRight: '6px', color: '#ef4444', fontWeight: 'bold' }}>
              (מושבת מהאתר)
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'קטגוריה',
      accessorKey: 'category',
      cell: ({ getValue }) => (
        <span style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
          {getValue() || 'כללי'}
        </span>
      ),
    },
    {
      header: 'מחיר (₪)',
      accessorKey: 'price',
      cell: ({ row }) => {
        const product = row.original;
        const isEditing = editingPriceId === product.id;

        return isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSavePrice(product.id);
                if (e.key === 'Escape') setEditingPriceId(null);
              }}
              style={{ width: '70px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #d19e61', outline: 'none' }}
              autoFocus
            />
            <button
              onClick={() => handleSavePrice(product.id)}
              title="שמור"
              style={{ border: 'none', background: '#22c55e', color: '#fff', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => setEditingPriceId(null)}
              title="בטל"
              style={{ border: 'none', background: '#cbd5e1', color: '#334155', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>₪{product.price}</span>
            <button
              onClick={() => { setEditingPriceId(product.id); setNewPrice(product.price); }}
              title="ערוך מחיר"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
            >
              <Edit2 size={14} />
            </button>
          </div>
        );
      },
    },
    {
      header: 'סטטוס',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <button
            onClick={() => handleToggleProductActive(product)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: product.isActive ? '#fee2e2' : '#ecfdf5',
              color: product.isActive ? '#b91c1c' : '#047857'
            }}
          >
            {product.isActive ? (
              <>
                <Trash2 size={13} /> השבת מוצר
              </>
            ) : (
              <>
                <RotateCcw size={13} /> החזר לאתר
              </>
            )}
          </button>
        );
      },
    },
  ], [editingPriceId, newPrice]);

  const table = useReactTable({
    data: products,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* סרגל עליון */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="חיפוש מוצר בקטלוג..."
            value={globalFilter ?? ''}
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

      {/* טבלה */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  לא נמצאו מוצרים.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: row.original.isActive ? '#fff' : '#fcfcfc'
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ padding: '0.75rem 1rem' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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