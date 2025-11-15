import styles from './PaymentBreakdown.module.css';
import { useMemo } from 'react';

export default function PaymentBreakdown({ orders }) {
  
  // Calcula os totais por forma de pagamento
  const breakdown = useMemo(() => {
    const totals = {};

    for (const order of orders) {
      if (!totals[order.payment]) {
        totals[order.payment] = 0;
      }
      totals[order.payment] += order.total;
    }

    // Apenas formata os valores
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value: value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    }));
  }, [orders]);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Faturamento por Pagamento</h3>
      <div className={styles.list}>
        {breakdown.length === 0 && (
          <p className={styles.empty}>Nenhum faturamento no período.</p>
        )}
        {breakdown.map((item) => (
          // Renderização limpa, sem a barra
          <div className={styles.item} key={item.name}>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.value}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}