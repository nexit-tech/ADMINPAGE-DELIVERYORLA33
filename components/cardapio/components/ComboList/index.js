import styles from './ComboList.module.css'; 
import { IoPencil, IoTrash } from 'react-icons/io5'; 

// Sub-componente para o item do combo (MODIFICADO)
function ComboItem({ combo, onEdit, onDelete }) {
  return (
    <div className={styles.item}>
      {/* --- ADICIONA A IMAGEM AQUI --- */}
      {combo.image_url && (
        <img 
          src={combo.image_url} 
          alt={combo.name} 
          className={styles.itemImage} 
        />
      )}

      <div className={styles.info}>
        <h4 className={styles.name}>{combo.name}</h4>
        {/* Corrigido para 'base_price' (snake_case) que vem do DB */}
        <span className={styles.price}>R$ {parseFloat(combo.base_price).toFixed(2)}</span>
      </div>
      <div className={styles.actions}>
        <button 
          className={`${styles.actionButton} ${styles.deleteButton}`} 
          onClick={() => onDelete(combo.id, combo.name)}
        >
          <IoTrash />
        </button>
        <button 
          className={`${styles.actionButton} ${styles.editButton}`} 
          onClick={() => onEdit(combo)}
        >
          <IoPencil /> Editar
        </button>
      </div>
    </div>
  );
}

// ... (Resto do arquivo não muda) ...
export default function ComboList({ combos, onAddCombo, onEditCombo, onDeleteCombo }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Promoções (Combos)</h2>
        <button className={styles.addButton} onClick={onAddCombo}>
          Adicionar Promoção
        </button>
      </div>
      <div className={styles.list}>
        {combos.length === 0 ? (
          <p className={styles.empty}>Nenhuma promoção (combo) criada.</p>
        ) : (
          combos.map(combo => (
            <ComboItem 
              key={combo.id} 
              combo={combo} 
              onEdit={onEditCombo} 
              onDelete={onDeleteCombo} 
            />
          ))
        )}
      </div>
    </div>
  );
}