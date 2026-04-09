import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiLinkedin } from 'react-icons/fi';
import { FaPinterest } from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.featureBar}>
        <div className="container">
          <div className={styles.features}>
            {[
              { icon: '🎓', title: 'Learn From Experts', desc: 'Learn Directly from Experienced Mentors' },
              { icon: '🏆', title: 'Earn a Certificate', desc: 'Get Recognized for Your Skills' },
              { icon: '💻', title: '5000+ Courses', desc: 'Find the Right Course for Every Goal' },
            ].map((f) => (
              <div key={f.title} className={styles.featureItem}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.mainFooter}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.brand}>
              <Link to="/" className={styles.logo}>
                <div className={styles.logoIcon}>O</div>
                <span>TLB LMS</span>
              </Link>
              <p>Embark on Your Smart Learning Path with TLB LMS</p>
              <div className={styles.socials}>
                <a href="#" aria-label="Facebook"><FiFacebook /></a>
                <a href="#" aria-label="Twitter"><FiTwitter /></a>
                <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
                <a href="#" aria-label="Pinterest"><FaPinterest /></a>
              </div>
            </div>

            <div className={styles.linksCol}>
              <h4>Support</h4>
              <ul>
                <li><Link to="/courses">Courses</Link></li>
                <li><Link to="/forum">Forum</Link></li>
                <li><Link to="/help">Help Center</Link></li>
              </ul>
            </div>

            <div className={styles.linksCol}>
              <h4>Contact Info</h4>
              <ul className={styles.contactList}>
                <li>📍 No 1469, Kadawalawewa, Jayanthipura, Polonnaruwa.</li>
                <li>📞 +94 70 520 0037</li>
                <li>✉️ info@oeti.edu.lk</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className="container">
          <div className={styles.bottomInner}>
            <div className={styles.logoSmall}>
              <div className={styles.logoIcon}>O</div>
            </div>
            <p>© 2025 TLB-LMS | Design & Developed By <a href="#" className={styles.credit}>SLdigital Web Solutions</a></p>
            <Link to="/verify-certificate" className={styles.verifyLink}>Verify Certificate</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
