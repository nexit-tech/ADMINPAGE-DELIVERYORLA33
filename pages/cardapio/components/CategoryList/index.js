import { useState } from 'react';
import styles from './CategoryList.module.css';
import { IoChevronDown, IoTrash } from 'react-icons/io5'; // <-- Adicione IoTrash

export default function CategoryList({
  categories,
  selectedId,
  onSelect,
  onAddCategory,
  onDeleteCategory, // <-- Nova prop
}) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

  // ... (funções toggleCategories e handleSelect)
  const toggleCategories = () => setIsCategoriesOpen(!isCategoriesOpen);
  const handleSelect = (id) => onSelect(id);

  return (
    <nav className={styles.sidebar}>
      {/* ... (Item Fixo: Promoções) ... */}
      <ul className={styles.topList}>
        <li>
          <button
            className={selectedId === 'promocoes' ? styles.active : ''}
            onClick={() => handleSelect('promocoes')}
          >
            Promoções
          </button>
        </li>
      </ul>

      {/* ... (Header do Accordion) ... */}
      <div className={styles.accordionHeader} onClick={toggleCategories}>
        <h3>Categorias</h3>
        <IoChevronDown
          className={`${styles.chevron} ${isCategoriesOpen ? styles.open : ''}`}
        />
      </div>

      <div
        className={`${styles.collapsible} ${isCategoriesOpen ? styles.open : ''}`}
      >
        <ul className={styles.list}>
          {categories.map((cat) => (
            <li key={cat.id}>
              {/* --- BOTÃO DE SELEÇÃO MODIFICADO --- */}
              <button
                className={`${styles.categoryButton} ${selectedId === cat.id ? styles.active : ''}`}
                onClick={() => handleSelect(cat.id)}
              >
                {cat.name}
              </button>
              {/* --- BOTÃO DE EXCLUIR NOVO --- */}
              <button
                className={styles.deleteCategoryButton}
                onClick={(e) => {
                  e.stopPropagation(); // Impede de selecionar a categoria
                  onDeleteCategory(cat.id, cat.name); // Chama a nova função
                }}
              >
                <IoTrash />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ... (Botão de Adicionar) ... */}
      <div className={styles.footer}>
        <button className={styles.addButton} onClick={onAddCategory}>
          + Nova Categoria
        </button>
      </div>
    </nav>
  );
}