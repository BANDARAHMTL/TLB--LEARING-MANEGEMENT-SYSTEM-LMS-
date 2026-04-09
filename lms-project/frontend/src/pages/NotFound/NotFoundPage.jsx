import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.glowOrb} />
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.desc}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link to="/" className="btn btn-primary btn-lg">
            <FiArrowLeft /> Back to Home
          </Link>
          <Link to="/courses" className="btn btn-outline btn-lg">
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
