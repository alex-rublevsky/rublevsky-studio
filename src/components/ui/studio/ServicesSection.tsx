import styles from "./services.module.css";
import { TextEffect } from "~/components/motion_primitives/AnimatedText";
export default function ServicesSection() {
  return (
    <section>
      <TextEffect as="h2" className="mb-10">
        Services offered
      </TextEffect>
      <div className={styles.servicesGrid}>
        <div className={styles.serviceRow}>
          <div className={styles.serviceItem}>
            Accessibility audit & optimization
          </div>
          <div className={styles.serviceItem}>Animation</div>
        </div>
        <div className={styles.serviceRow}>
          <div className={styles.serviceItem}>Branding & Strategy</div>
          <div className={styles.serviceItem}>Custom Code/Scripting</div>
        </div>
        <div className={styles.serviceRow}>
          <div className={styles.serviceItem}>Data and Analytics</div>
          <div className={styles.serviceItem}>
            Digital Marketing & Advertising
          </div>
        </div>
        <div className={styles.serviceRow}>
          <div className={styles.serviceItem}>E-commerce Development</div>
          <div className={styles.serviceItem}>Graphic Design</div>
        </div>
        <div className={styles.serviceRow}>
          <div className={styles.serviceItem}>Photography/Video</div>
          <div className={styles.serviceItem}>Web Design (UI/UX)</div>
        </div>
        <div className={styles.serviceRow}>
          <div className={styles.serviceItem}>Web Development</div>
          <div className={styles.serviceItem}>3D Design</div>
        </div>
        <div className={styles.serviceRow}>
          <div className={styles.serviceItem}>Logo</div>
          <div className={styles.serviceItem}>3rd Party Integrations</div>
        </div>
      </div>
    </section>
  );
}
