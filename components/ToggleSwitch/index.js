import styles from './ToggleSwitch.module.css';

export default function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className={styles.switch}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.slider}></span>
      <span className={styles.label}>{label}</span>
    </label>
  );
}