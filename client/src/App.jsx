import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import { Clock, ShoppingBag, MapPin, MessageCircle, ArrowDown } from 'lucide-react';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';

const CATEGORIES = [
  'הכל',
  'לחמים וממרחים',
  'מאפים מלוחים וסלטים',
  'עוגות פס',
  'עוגות עגולות',
  'עוגיות',
  'מארזים מתוקים',
  'מארזים מלוחים'
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const menuRef = useRef(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => {
        if (!res.ok) throw new Error('שגיאה בתקשורת עם השרת');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('לא הצלחנו לטעון את המוצרים מהשרת');
        setLoading(false);
      });
  }, []);

  const totalAmount = cart.reduce((sum, item) => {
    const price = Number(item.unitPrice ?? item.price ?? item.selectedOption?.price ?? item.basePrice ?? 0);
    return sum + (price * item.quantity);
  }, 0);

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = (item) => {
    setCart(prev => [...prev, item]);
  };

  const handleUpdateQuantity = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
    } else {
      setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity: newQty } : item));
    }
  };

  const handleRemoveItem = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // const filteredProducts = selectedCategory === 'הכל'
  //   ? products
  //   : products.filter(p => p.category === selectedCategory);

// דירוג עדיפות לקטגוריות בתצוגת "הכל" (מספר נמוך יותר = יופיע למעלה יותר)
const CATEGORY_PRIORITY = {
  'מארזים מתוקים': 1,
  'מארזים מלוחים': 2,
  'עוגות עגולות': 3,
  'עוגות פס': 4,
  'עוגיות': 5,
  'מאפים מלוחים וסלטים': 6,
  'לחמים וממרחים': 7
};

// פונקציית עזר למיון פנימי בתוך "לחמים וממרחים"
const getBreadPriority = (productName) => {
  const name = productName.toLowerCase();
  // ממרחים - יופיעו אחרונים
  if (name.includes('ממרח') || name.includes('טחינה') || name.includes('טפנד') || name.includes('שמנת')) {
    return 3;
  }
  // חלות - יופיעו באמצע (אחרי הלחמים המיוחדים)
  if (name.includes('חלה') || name.includes('חלת')) {
    return 2;
  }
  // לחמים מיוחדים, לחמניות, פרעצלס - יופיעו ראשונים
  return 1;
};

// סינון ומיון המוצרים המוצגים
const filteredProducts = [...products]
  .filter(p => selectedCategory === 'הכל' || p.category === selectedCategory)
  .sort((a, b) => {
    // 1. מיון ספציפי עבור קטגוריית "לחמים וממרחים"
    if (a.category === 'לחמים וממרחים' && b.category === 'לחמים וממרחים') {
      const priorityA = getBreadPriority(a.name);
      const priorityB = getBreadPriority(b.name);
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
    }

    // 2. מיון תצוגת "הכל" לפי סדר האטרקטיביות של הקטגוריות
    if (selectedCategory === 'הכל') {
      const catA = CATEGORY_PRIORITY[a.category] || 99;
      const catB = CATEGORY_PRIORITY[b.category] || 99;
      if (catA !== catB) {
        return catA - catB;
      }
    }

    return 0; // שמירה על הסדר הקיים אם העדיפות זהה
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} />

      {/* 1. Hero */}
      <section style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        padding: '3rem 1.5rem',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          <div>
            <h1 className="font-title" style={{
              fontSize: '2.8rem',
              color: 'var(--primary-teal)',
              margin: '0 0 0.5rem 0',
              lineHeight: 1.1
            }}>
              רעות אביטל
            </h1>
            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: '600',
              color: 'var(--accent-caramel)',
              margin: '0 0 1.2rem 0'
            }}>
              מתוק מלוח ומה שביניהם
            </h2>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              color: 'var(--dark-slate)',
              marginBottom: '1.8rem'
            }}>
              אפייה ביתית מוקפדת עם חומרי גלם מובחרים והמון תשומת לב לכל פרט. 
              כל המאפים, המארזים והקינוחים נאפים לפי הזמנה אישית ומגיעים אליכם הכי טריים שיש.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={scrollToMenu}
                style={{
                  backgroundColor: 'var(--primary-teal)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem 1.75rem',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 10px rgba(30, 164, 168, 0.25)'
                }}
              >
                לצפייה בתפריט והזמנה
                <ArrowDown size={18} />
              </button>
              <a
                href="https://wa.me/972543979760"
                target="_blank"
                rel="noreferrer"
                style={{
                  backgroundColor: '#ffffff',
                  color: 'var(--primary-teal)',
                  border: '2px solid var(--primary-teal)',
                  borderRadius: '10px',
                  padding: '0.85rem 1.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <MessageCircle size={18} />
                שאלות בוואטסאפ
              </a>
            </div>
          </div>

          <div style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            aspectRatio: '4/3',
            backgroundColor: '#eef8f8',
            border: '2px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
          }}>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src="/logo.png" 
                alt="לוגו רעות אביטל" 
                style={{ 
                  width: '130px', 
                  height: '130px', 
                  borderRadius: '50%', 
                  marginBottom: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <p style={{ margin: 0, fontWeight: '700', color: 'var(--primary-teal)', fontSize: '1.15rem' }}>
                רעות אביטל
              </p>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                אפייה בוטיק ביתית
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. איך ההזמנה עובדת? */}
      <section style={{ backgroundColor: 'var(--bg-cream)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 className="font-title" style={{ textAlign: 'center', fontSize: '1.8rem', color: 'var(--dark-slate)', marginBottom: '1.8rem' }}>
            איך ההזמנה עובדת?
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.25rem'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <div style={{ backgroundColor: '#eef8f8', padding: '0.75rem', borderRadius: '10px', color: 'var(--primary-teal)' }}>
                <Clock size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem' }}>הזמנה מראש</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  לפחות <strong>3 ימים מראש</strong>.<br />
                  הזמנות לסופ"ש נסגרות ביום <strong>רביעי ב-13:00</strong>.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <div style={{ backgroundColor: '#fff6ec', padding: '0.75rem', borderRadius: '10px', color: 'var(--accent-caramel)' }}>
                <MapPin size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem' }}>איסוף או משלוח</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  <strong>איסוף עצמי מלוד</strong> בתיאום שעה, או משלוח עד הבית לפי כתובת.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <div style={{ backgroundColor: '#eef8f8', padding: '0.75rem', borderRadius: '10px', color: 'var(--primary-teal)' }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem' }}>טריות מרבית</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  כל פריט נאפה במועד המסירה כדי להבטיח איכות, ניחוח וטריות מקסימליים.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. תפריט */}
      <main ref={menuRef} style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem', flexGrow: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 className="font-title" style={{ fontSize: '2.2rem', color: 'var(--dark-slate)', margin: '0 0 0.5rem 0' }}>
            התפריט שלנו
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            בחרו קטגוריה לצפייה במאפים, בעוגות ובמארזים
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.65rem',
          marginBottom: '2.5rem'
        }}>
          {CATEGORIES.map(category => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '25px',
                  border: isActive ? '2px solid var(--primary-teal)' : '1px solid var(--border-color)',
                  backgroundColor: isActive ? 'var(--primary-teal)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--dark-slate)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(30,164,168,0.25)' : 'none'
                }}
              >
                {category}
              </button>
            );
          })}
        </div>

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>טוען תפריט...</p>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            אין עדיין מוצרים בקטגוריה זו.
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={(prod) => setSelectedProductForModal(prod)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 4. מודל בחירת מוצר */}
      {selectedProductForModal && (
        <ProductModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* 5. מגירת עגלה */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
    setIsCartOpen(false);      // סוגר את עגלת הקניות
    setIsCheckoutOpen(true);    // פותח את טופס מילוי הפרטים
    }}
      />

<CheckoutModal
  isOpen={isCheckoutOpen}
  onClose={() => setIsCheckoutOpen(false)}
  cart={cart}
  totalAmount={totalAmount}
  onOrderSuccess={(orderData) => {
    alert('ההזמנה נקלטה בהצלחה! שלחנו את הפרטים לוואטסאפ.');
    setCart([]); // איפוס הסל
  }}
/>

      {/* 6. פוטר */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 1.5rem',
        marginTop: '3rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div>
            <h4 className="font-title" style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: 'var(--primary-teal)' }}>
              רעות אביטל | מתוק מלוח ומה שביניהם
            </h4>
            {/* <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              איסוף עצמי מלוד | משלוחים בתיאום מראש
            </p> */}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>להזמנות ובירורים מיוחדים:</span>
            <a
              href="https://wa.me/972543979760"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--primary-teal)',
                fontWeight: '700'
              }}
            >
              <MessageCircle size={20} />
              וואטסאפ
            </a>
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              style={{
                background: 'none',
                border: '1px dashed var(--border-color)',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
              title="כניסה לממשק בעלת העסק"
            >
              ניהול
            </button>
          </div>
        </div>
      </footer>
      {/* מודל הדשבורד של האדמין */}
      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}