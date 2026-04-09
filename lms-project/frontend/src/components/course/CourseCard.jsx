import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiStar, FiUsers, FiClock } from 'react-icons/fi';
import { addToCart } from '../../redux/slices/cartSlice';
import { userAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import styles from './CourseCard.module.css';

export default function CourseCard({ course }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart(course));
    toast.success('Added to cart!');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to add to wishlist'); return; }
    try {
      await userAPI.toggleWishlist(course._id);
      toast.success('Wishlist updated!');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const isEnrolled = user?.enrolledCourses?.includes(course._id);

  return (
    <Link to={`/courses/${course.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={course.thumbnail} alt={course.title} className={styles.image} loading="lazy" />
        {course.isNew && <span className={`badge badge-new ${styles.newBadge}`}>New course</span>}
        {course.discountPrice && course.discountPrice < course.price && (
          <span className={styles.discountBadge}>
            {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
          </span>
        )}
        <button className={styles.wishlistBtn} onClick={handleWishlist} aria-label="Add to wishlist">
          <FiHeart />
        </button>
      </div>

      <div className={styles.body}>
        {course.category && (
          <span className={styles.category}>{course.category.name || course.category}</span>
        )}
        <h3 className={styles.title}>{course.title}</h3>
        {course.shortDescription && (
          <p className={styles.desc}>{course.shortDescription}</p>
        )}

        <div className={styles.instructor}>
          {course.instructor?.name || 'TLB STAFF'}
        </div>

        <div className={styles.meta}>
          <div className={styles.rating}>
            <FiStar className={styles.starIcon} />
            <span className={styles.ratingNum}>{course.rating?.toFixed(1) || '0.0'}</span>
            <span className={styles.ratingCount}>({course.numReviews || 0})</span>
          </div>
          {course.totalDuration > 0 && (
            <div className={styles.metaItem}>
              <FiClock /> {Math.round(course.totalDuration / 3600)}h
            </div>
          )}
          {course.enrolledStudents > 0 && (
            <div className={styles.metaItem}>
              <FiUsers /> {course.enrolledStudents}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.priceWrap}>
            <span className={styles.price}>
              {course.currency || 'Rs'} {(course.discountPrice || course.price).toLocaleString()}
            </span>
            {course.discountPrice && course.discountPrice < course.price && (
              <span className={styles.originalPrice}>
                Rs {course.price.toLocaleString()}
              </span>
            )}
          </div>

          {isEnrolled ? (
            <span className={`badge badge-success`}>Enrolled</span>
          ) : (
            <button className={styles.addBtn} onClick={handleAddToCart}>
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
