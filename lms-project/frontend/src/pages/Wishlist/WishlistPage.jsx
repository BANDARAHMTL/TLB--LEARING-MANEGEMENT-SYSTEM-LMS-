import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { userAPI } from '../../utils/api';
import { addToCart } from '../../redux/slices/cartSlice';
import { getMyProfile } from '../../redux/slices/authSlice';
import { Spinner } from '../../components/common/Loaders';
import toast from 'react-hot-toast';
import styles from './WishlistPage.module.css';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const wishlist = user?.wishlist || [];

  useEffect(() => {
    dispatch(getMyProfile()).finally(() => setLoading(false));
  }, [dispatch]);

  const handleRemove = async (courseId) => {
    try {
      await userAPI.toggleWishlist(courseId);
      dispatch(getMyProfile());
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleAddToCart = (course) => {
    dispatch(addToCart(course));
    toast.success('Added to cart!');
  };

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1><FiHeart /> My Wishlist</h1>
          <p>{wishlist.length} course{wishlist.length !== 1 ? 's' : ''}</p>
        </div>

        {wishlist.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💝</div>
            <h2>Your wishlist is empty</h2>
            <p>Save courses you want to take later by clicking the heart icon.</p>
            <Link to="/courses" className="btn btn-primary btn-lg">Explore Courses</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {wishlist.map((course) => (
              <div key={course._id || course} className={styles.card}>
                {course.thumbnail && (
                  <Link to={`/courses/${course.slug}`}>
                    <img src={course.thumbnail} alt={course.title} className={styles.thumb} />
                  </Link>
                )}
                <div className={styles.info}>
                  <Link to={`/courses/${course.slug}`}>
                    <h3 className={styles.title}>{course.title || 'Course'}</h3>
                  </Link>
                  {course.instructor?.name && (
                    <p className={styles.instructor}>{course.instructor.name}</p>
                  )}
                  <p className={styles.price}>
                    {course.price === 0 ? 'Free' : `Rs ${(course.discountPrice || course.price || 0).toLocaleString()}`}
                  </p>
                </div>
                <div className={styles.actions}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAddToCart(course)}
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(course._id || course)}
                    title="Remove from wishlist"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
