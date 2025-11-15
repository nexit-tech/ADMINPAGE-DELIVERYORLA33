import styles from './StyledSelect.module.css';

export default function StyledSelect({ className, children, ...props }) {
  const combinedClassName = `${styles.styledSelect} ${className || ''}`;
  return (
    <select className={combinedClassName} {...props}>
      {children}
    </select>
  );
}