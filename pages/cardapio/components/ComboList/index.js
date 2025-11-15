import styles from './ComboList.module.css'; // <-- ESTA É A CORREÇÃO
import { IoPencil, IoTrash } from 'react-icons/io5'; // <-- Adicionei IoTrash (vamos precisar)

// Sub-componente para o item do combo
function ComboItem({ combo, onEdit, onDelete }) { // <-- Adicionei onDelete
  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <h4 className={styles.name}>{combo.name}</h4>
        <span className={styles.price}>R$ {combo.base_price.toFixed(2)}</span>
      </div>
      <div className={styles.actions}>
        {/* --- Adicionando Botão de Excluir --- */}
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

// Componente principal da lista
export default function ComboList({ combos, onAddCombo, onEditCombo, onDeleteCombo }) { // <-- Adicionei onDeleteCombo
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
              onDelete={onDeleteCombo} // <-- Passa a prop
            />
          ))
        )}
      </div>
    </div>
  );
}