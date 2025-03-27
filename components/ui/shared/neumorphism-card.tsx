import styles from "./neumorphism-card.module.css";

function NeumorphismCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}

export default NeumorphismCard;
