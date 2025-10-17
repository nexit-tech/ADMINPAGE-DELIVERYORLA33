import React from 'react';
import styles from './ProdutoItem.module.css';

function ProdutoItem({ produto, onEdit, onDelete }) {
  return (
    <li className={styles.produtoItem}>
      <img src={produto.imagem} alt={produto.nome} className={styles.produtoImagem} />
      <div className={styles.produtoInfo}>
        <h3 className={styles.produtoNome}>{produto.nome}</h3>
        <p className={styles.produtoDescricao}>{produto.descricao}</p>
        <span className={styles.produtoPreco}>R$ {produto.preco.toFixed(2)}</span>
      </div>
      <div className={styles.produtoActions}>
        <button
          className={styles.editButton}
          onClick={() => onEdit(produto.id)}
        >
          Editar
        </button>
        <button
          className={styles.deleteButton}
          onClick={() => onDelete(produto.id)}
        >
          Excluir
        </button>
      </div>
    </li>
  );
}

export default ProdutoItem;