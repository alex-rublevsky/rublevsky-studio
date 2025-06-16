import styles from "./services.module.css";
import { TextEffect } from "~/components/motion_primitives/AnimatedText";

export default function ServicesSection() {
  const services = [
    "Accessibility audit & optimization",
    "Web Animations",
    "Logo & Branding",
    "Custom Code/Scripting",
    "Data and Analytics",
    "E-commerce Development",
    "Graphic Design",
    "Photography",
    "Web Design (UI/UX)",
    "Web Development",
    "3D & Motion Design",
    "3rd Party Integrations"
  ];

  // Group services into pairs for rows
  const serviceRows = [];
  for (let i = 0; i < services.length; i += 2) {
    serviceRows.push(services.slice(i, i + 2));
  }

  return (
    <section>
      <TextEffect as="h2" className="mb-10">
        Services offered
      </TextEffect>
      <div className={styles.servicesGrid}>
        {serviceRows.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.serviceRow}>
            {row.map((service, serviceIndex) => (
              <div key={serviceIndex} className={styles.serviceItem}>
                {service}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
