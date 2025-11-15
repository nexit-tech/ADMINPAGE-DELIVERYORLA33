import styles from './OrderColumn.module.css';

export default function OrderColumn({ title, count, children }) {
  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <span className={styles.count}>{count}</span>
      </div>
      <div className={styles.content}>
        {/* Aqui entrarão os cards dos pedidos */}
        {children}
      </div>
    </div>
  );
}