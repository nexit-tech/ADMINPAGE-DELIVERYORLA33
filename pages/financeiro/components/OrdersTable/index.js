import styles from './OrdersTable.module.css';

export default function OrdersTable({ orders }) {
  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Pedido ID</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Pagamento</th>
            <th>Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.date}</td>
              <td>{order.client}</td>
              <td>
                <span className={`${styles.badge} ${styles[order.payment.toLowerCase().replace(' ', '')]}`}>
                  {order.payment}
                </span>
              </td>
              <td>{formatCurrency(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}