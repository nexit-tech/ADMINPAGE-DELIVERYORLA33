import styles from './OrderCard.module.css';

export default function OrderCard({ 
  pedido, 
  onAccept, 
  onRefuse, 
  onSend, 
  onFinish 
}) {

  const renderActions = () => {
    switch (pedido.status) {
      case 'novo':
        return (
          <>
            <button 
              className={`${styles.button} ${styles.refuse}`}
              onClick={() => onRefuse(pedido.id)}
            >
              Recusar
            </button>
            <button 
              className={`${styles.button} ${styles.accept}`}
              onClick={() => onAccept(pedido.id)}
            >
              Aceitar
            </button>
          </>
        );
      case 'producao':
        return (
          <button 
            className={`${styles.button} ${styles.send}`}
            onClick={() => onSend(pedido.id)}
          >
            Enviar para Entrega
          </button>
        );
      case 'entrega':
        return (
          <button 
            className={`${styles.button} ${styles.finish}`}
            onClick={() => onFinish(pedido.id)}
          >
            Finalizar Pedido
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.details}>
        <h3 className={styles.clientName}>{pedido.clientName}</h3>
        <p className={styles.address}>{pedido.address}</p>
        <ul className={styles.itemsList}>
          {pedido.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.actions}>
        {renderActions()}
      </div>
    </div>
  );
}