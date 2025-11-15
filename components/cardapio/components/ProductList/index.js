import styles from './ProductList.module.css';
import { IoPencil, IoTrash } from 'react-icons/io5';

// Sub-componente para o item do produto (COM alteração)
function ProductItem({ product, onEdit, onDelete }) {
  const hasPromo = product.promo_price && parseFloat(product.promo_price) > 0;

  return (
    <div className={styles.item}>
      {/* --- ADICIONA A IMAGEM AQUI --- */}
      {product.image_url && (
        <img 
          src={product.image_url} 
          alt={product.name} 
          className={styles.itemImage} 
        />
      )}

      <div className={styles.info}>
        <h4 className={styles.name}>{product.name}</h4>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.priceBox}>
          {hasPromo ? (
            <>
              <span className={styles.oldPrice}>R$ {product.price}</span>
              <span className={styles.promoPrice}>R$ {product.promo_price}</span>
            </>
          ) : (
            <span className={styles.price}>R$ {product.price}</span>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <button 
          className={`${styles.actionButton} ${styles.deleteButton}`} 
          onClick={() => onDelete(product.id, product.name)}
        >
          <IoTrash />
        </button>
        <button 
          className={`${styles.actionButton} ${styles.editButton}`} 
          onClick={() => onEdit(product)}
        >
          <IoPencil /> Editar
        </button>
      </div>
    </div>
  );
}

// ... (Restante do arquivo não muda) ...
export default function ProductList({ 
  title,
  products, 
  onAddProduct, 
  onEditProduct,
  onDeleteProduct,
  disableAdd 
}) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <button 
          className={styles.addButton} 
          onClick={onAddProduct}
          disabled={disableAdd}
        >
          Adicionar Produto
        </button>
      </div>
      <div className={styles.list}>
        {products.length === 0 ? (
          <p className={styles.empty}>
            {disableAdd 
              ? "Não há produtos em promoção no momento." 
              : "Nenhum produto nesta categoria."}
          </p>
        ) : (
          products.map(prod => (
            <ProductItem 
              key={prod.id} 
              product={prod} 
              onEdit={onEditProduct} 
              onDelete={onDeleteProduct}
            />
          ))
        )}
      </div>
    </div>
  );
}