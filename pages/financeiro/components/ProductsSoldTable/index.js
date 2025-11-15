import styles from './ProductsSoldTable.module.css';

export default function ProductsSoldTable({ products }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade Vendida</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.name}>
              <td>{product.name}</td>
              <td>{product.quantity}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="2" className={styles.empty}>
                Nenhum produto vendido no período selecionado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}