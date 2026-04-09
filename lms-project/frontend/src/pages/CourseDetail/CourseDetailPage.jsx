import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiStar, FiUsers, FiClock, FiPlay, FiCheck,
  FiChevronDown, FiChevronUp, FiGlobe, FiAward,
  FiHeart, FiShare2, FiShoppingCart,
} from 'react-icons/fi';
import { fetchCourseBySlug } from '../../redux/slices/courseSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { reviewAPI } from '../../utils/api';
import { Spinner } from '../../components/common/Loaders';
import toast from 'react-hot-toast';
import styles from './CourseDetailPage.module.css';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: course, loading } = useSelector((s) => s.courses);
  const { user } = useSelector((s) => s.auth);
  const { items: cartItems } = useSelector((s) => s.cart);
  const [reviews, setReviews] = useState([]);
  const [openSections, setOpenSections] = useState({ 0: true });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchCourseBySlug(slug));
    reviewAPI.getByCourse(slug).then(({ data }) => setReviews(data)).catch(() => {});
    window.scrollTo({ top: 0 });
  }, [slug, dispatch]);

  const isEnrolled = user?.enrolledCourses?.some(
    (c) => c === course?._id || c._id === course?._id
  );
  const isInCart = cartItems.some((i) => i._id === course?._id);

  const handleAddToCart = () => {
    dispatch(addToCart(course));
    toast.success('Added to cart!');
  };

  const handleEnroll = () => {
    if (!user) { navigate('/login'); return; }
    if (course.price === 0) {
      // Free course: direct enroll
      toast.success('Enrolled for free!');
    } else {
      dispatch(addToCart(course));
      navigate('/cart');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to review'); return; }
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
    setReviewLoading(true);
    try {
      const { data } = await reviewAPI.create({ courseId: course._id, ...reviewForm });
      setReviews((prev) => [{ ...data, user: { name: user.name, avatar: user.avatar } }, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const toggleSection = (i) => setOpenSections((prev) => ({ ...prev, [i]: !prev[i] }));

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={50} /></div>;
  if (!course) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h2>Course not found</h2>
      <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Courses</Link>
    </div>
  );

  const totalLectures = course.sections?.reduce((s, sec) => s + (sec.lectures?.length || 0), 0) || 0;
  const totalHours = course.totalDuration ? Math.round(course.totalDuration / 3600) : 0;

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <div className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroLeft}>
              <div className={styles.breadcrumb}>
                <Link to="/">Home</Link> /
                <Link to="/courses">Courses</Link> /
                <span>{course.title}</span>
              </div>

              {course.category && (
                <span className={`badge badge-new ${styles.catBadge}`}>
                  {course.category.name || course.category}
                </span>
              )}

              <h1 className={styles.courseTitle}>{course.title}</h1>
              <p className={styles.courseDesc}>{course.shortDescription || course.description?.slice(0, 160)}</p>

              {/* Meta row */}
              <div className={styles.metaRow}>
                {course.rating > 0 && (
                  <div className={styles.ratingBadge}>
                    <span className={styles.ratingNum}>{course.rating.toFixed(1)}</span>
                    <div className={styles.stars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar key={i} className={i < Math.round(course.rating) ? styles.starFilled : styles.starEmpty} />
                      ))}
                    </div>
                    <span className={styles.reviewCount}>({course.numReviews} reviews)</span>
                  </div>
                )}
                {course.enrolledStudents > 0 && (
                  <div className={styles.metaItem}><FiUsers /> {course.enrolledStudents.toLocaleString()} students</div>
                )}
                {totalHours > 0 && (
                  <div className={styles.metaItem}><FiClock /> {totalHours}h total</div>
                )}
                {course.language && (
                  <div className={styles.metaItem}><FiGlobe /> {course.language}</div>
                )}
              </div>

              {course.instructor && (
                <p className={styles.instructorInfo}>
                  Created by <strong>{course.instructor.name}</strong>
                </p>
              )}

              {course.batchSchedule && (
                <div className={styles.batchBadge}>📅 {course.batchSchedule}</div>
              )}
            </div>

            {/* Sticky enroll card */}
            <div className={styles.enrollCard}>
              <div className={styles.coursePreview}>
                <img src={course.thumbnail} alt={course.title} className={styles.previewImage} />
                {course.previewVideo && (
                  <div className={styles.previewOverlay}>
                    <div className={styles.playBtn}><FiPlay /></div>
                    <span>Preview this course</span>
                  </div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.priceRow}>
                  <span className={styles.price}>
                    {course.price === 0 ? 'Free' : `${course.currency || 'Rs'} ${(course.discountPrice || course.price).toLocaleString()}`}
                  </span>
                  {course.discountPrice && course.discountPrice < course.price && (
                    <span className={styles.originalPrice}>Rs {course.price.toLocaleString()}</span>
                  )}
                </div>

                {isEnrolled ? (
                  <Link to={`/learn/${course.slug}`} className={`btn btn-primary ${styles.enrollBtn}`}>
                    <FiPlay /> Go to Course
                  </Link>
                ) : (
                  <>
                    <button className={`btn btn-primary ${styles.enrollBtn}`} onClick={handleEnroll}>
                      {course.price === 0 ? 'Enroll for Free' : 'Buy Now'}
                    </button>
                    {!isInCart && course.price > 0 && (
                      <button className={`btn btn-outline ${styles.cartBtn}`} onClick={handleAddToCart}>
                        <FiShoppingCart /> Add to Cart
                      </button>
                    )}
                    {isInCart && (
                      <Link to="/cart" className={`btn btn-outline ${styles.cartBtn}`}>
                        <FiShoppingCart /> View in Cart
                      </Link>
                    )}
                  </>
                )}

                <div className={styles.cardIncludes}>
                  <p className={styles.includesTitle}>This course includes:</p>
                  <ul>
                    {totalHours > 0 && <li><FiPlay /> {totalHours} hours on-demand video</li>}
                    {totalLectures > 0 && <li><FiCheck /> {totalLectures} lectures</li>}
                    {course.certificate && <li><FiAward /> Certificate of completion</li>}
                    <li><FiGlobe /> Full lifetime access</li>
                  </ul>
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.actionBtn}><FiHeart /> Wishlist</button>
                  <button className={styles.actionBtn}><FiShare2 /> Share</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className={styles.contentArea}>
        <div className="container">
          <div className={styles.tabs}>
            {['overview', 'curriculum', 'reviews'].map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className={styles.overview}>
                {course.whatYouLearn?.length > 0 && (
                  <div className={styles.section}>
                    <h2>What You'll Learn</h2>
                    <div className={styles.learnGrid}>
                      {course.whatYouLearn.map((item, i) => (
                        <div key={i} className={styles.learnItem}>
                          <FiCheck className={styles.checkIcon} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.requirements?.length > 0 && (
                  <div className={styles.section}>
                    <h2>Requirements</h2>
                    <ul className={styles.reqList}>
                      {course.requirements.map((req, i) => <li key={i}>{req}</li>)}
                    </ul>
                  </div>
                )}

                <div className={styles.section}>
                  <h2>Description</h2>
                  <p className={styles.description}>{course.description}</p>
                </div>

                {course.instructor && (
                  <div className={styles.section}>
                    <h2>Instructor</h2>
                    <div className={styles.instructorCard}>
                      <div className={styles.instructorAvatar}>
                        {course.instructor.avatar
                          ? <img src={course.instructor.avatar} alt={course.instructor.name} />
                          : <span>{course.instructor.name?.[0]}</span>
                        }
                      </div>
                      <div>
                        <h3>{course.instructor.name}</h3>
                        {course.instructor.bio && <p>{course.instructor.bio}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CURRICULUM */}
            {activeTab === 'curriculum' && (
              <div className={styles.curriculum}>
                <div className={styles.curriculumHeader}>
                  <h2>Course Content</h2>
                  <p>{course.sections?.length || 0} sections • {totalLectures} lectures • {totalHours}h total</p>
                </div>
                {course.sections?.length > 0
                  ? course.sections.map((section, i) => (
                    <div key={i} className={styles.sectionBlock}>
                      <button
                        className={styles.sectionHeader}
                        onClick={() => toggleSection(i)}
                      >
                        <div className={styles.sectionLeft}>
                          {openSections[i] ? <FiChevronUp /> : <FiChevronDown />}
                          <span>{section.title}</span>
                        </div>
                        <span className={styles.sectionMeta}>
                          {section.lectures?.length || 0} lectures
                        </span>
                      </button>
                      {openSections[i] && (
                        <div className={styles.lectures}>
                          {section.lectures?.map((lecture, j) => (
                            <div key={j} className={styles.lectureRow}>
                              <div className={styles.lectureLeft}>
                                <FiPlay className={styles.lectureIcon} />
                                <span>{lecture.title}</span>
                                {lecture.isPreview && <span className={styles.previewTag}>Preview</span>}
                              </div>
                              <span className={styles.lectureDuration}>
                                {lecture.duration ? `${Math.floor(lecture.duration / 60)}:${String(lecture.duration % 60).padStart(2, '0')}` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                  : (
                    <div className={styles.noCurriculum}>
                      <p>Curriculum will be available soon.</p>
                    </div>
                  )
                }
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === 'reviews' && (
              <div className={styles.reviewsSection}>
                <h2>Student Reviews</h2>

                {/* Rating summary */}
                {course.rating > 0 && (
                  <div className={styles.ratingSummary}>
                    <div className={styles.ratingBig}>
                      <span className={styles.ratingBigNum}>{course.rating.toFixed(1)}</span>
                      <div className={styles.starsLarge}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} className={i < Math.round(course.rating) ? styles.starFilled : styles.starEmpty} />
                        ))}
                      </div>
                      <span>Course Rating</span>
                    </div>
                  </div>
                )}

                {/* Review form */}
                {user && (
                  <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                    <h3>Write a Review</h3>
                    <div className={styles.ratingSelect}>
                      <label>Your Rating:</label>
                      <div className={styles.starPicker}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`${styles.starPickBtn} ${reviewForm.rating >= s ? styles.starPickActive : ''}`}
                            onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                          >
                            <FiStar />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      placeholder="Share your experience with this course..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={4}
                    />
                    <button type="submit" className="btn btn-primary" disabled={reviewLoading}>
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {/* Reviews list */}
                <div className={styles.reviewsList}>
                  {reviews.length === 0
                    ? <p className={styles.noReviews}>No reviews yet. Be the first to review!</p>
                    : reviews.map((r, i) => (
                      <div key={i} className={styles.reviewCard}>
                        <div className={styles.reviewerAvatar}>
                          {r.user?.avatar
                            ? <img src={r.user.avatar} alt={r.user.name} />
                            : <span>{r.user?.name?.[0]}</span>
                          }
                        </div>
                        <div className={styles.reviewContent}>
                          <div className={styles.reviewHeader}>
                            <strong>{r.user?.name}</strong>
                            <div className={styles.reviewStars}>
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <FiStar key={idx} className={idx < r.rating ? styles.starFilled : styles.starEmpty} />
                              ))}
                            </div>
                          </div>
                          <p>{r.comment}</p>
                          <span className={styles.reviewDate}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
