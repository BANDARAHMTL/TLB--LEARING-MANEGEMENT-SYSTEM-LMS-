import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { removeFromCart, clearCart } from '../../redux/slices/cartSlice';
import { orderAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import styles from './CartPage.module.css';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  const total = items.reduce((sum, i) => sum + (i.discountPrice || i.price || 0), 0);

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await orderAPI.create({ courseIds: items.map((i) => i._id), paymentMethod: 'stripe' });
      dispatch(clearCart());
      toast.success('Enrolled successfully!');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Checkout failed');
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.empty}>
            <FiShoppingCart size={60} />
            <h2>Your cart is empty</h2>
            <p>Browse our courses and add something you like!</p>
            <Link to="/courses" className="btn btn-primary btn-lg">Browse Courses</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Shopping Cart</h1>
        <p className={styles.count}>{items.length} course{items.length !== 1 ? 's' : ''} in cart</p>

        <div className={styles.layout}>
          <div className={styles.cartList}>
            {items.map((item) => (
              <div key={item._id} className={styles.cartItem}>
                <img src={item.thumbnail} alt={item.title} className={styles.cartThumb} />
                <div className={styles.cartInfo}>
                  <h3>{item.title}</h3>
                  <p>{item.instructor?.name || 'TLB STAFF'}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {item.level && <span className="badge badge-new">{item.level}</span>}
                  </div>
                </div>
                <div className={styles.cartRight}>
                  <p className={styles.cartPrice}>Rs {(item.discountPrice || item.price || 0).toLocaleString()}</p>
                  <button className={styles.removeBtn} onClick={() => dispatch(removeFromCart(item._id))}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal ({items.length} items)</span>
              <span>Rs {total.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Discount</span>
              <span className={styles.discount}>- Rs 0</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>Rs {total.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCheckout}>
              Proceed to Checkout <FiArrowRight />
            </button>
            <Link to="/courses" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
