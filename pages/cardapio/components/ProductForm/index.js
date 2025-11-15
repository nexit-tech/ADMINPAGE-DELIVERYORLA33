import { useState, useEffect } from 'react';
import styles from './ProductForm.module.css';

export default function ProductForm({ onSubmit, initialData = {} }) {
  // Estados em camelCase (padrão do React)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');

  // Preenche o form quando 'initialData' (para edição) é carregado
  useEffect(() => {
    setName(initialData.name || '');
    setDescription(initialData.description || '');
    setPrice(initialData.price || '');
    // --- CORREÇÃO 1: Carrega do banco (snake_case) ---
    setPromoPrice(initialData.promo_price || ''); 
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- CORREÇÃO 2: Envia para o Supabase (snake_case) ---
    onSubmit({ 
      name, 
      description, 
      price: parseFloat(price) || 0, // Garante que é um número
      promo_price: parseFloat(promoPrice) || null // Envia como snake_case
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Nome do Produto</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Pizza Calabresa"
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="description">Descrição</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Molho, mussarela, calabresa e cebola"
        />
      </div>
      <div className={styles.priceGroup}>
        <div className={styles.formGroup}>
          <label htmlFor="price">Preço Base (R$)</label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex: 50.00"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="promoPrice">Preço Promocional (Opcional)</label>
          <input
            id="promoPrice"
            type="number"
            step="0.01"
            value={promoPrice} // O input usa o estado (camelCase)
            onChange={(e) => setPromoPrice(e.target.value)}
            placeholder="Ex: 45.00"
          />
        </div>
      </div>
      <button type="submit" className={styles.saveButton}>
        Salvar Produto
      </button>
    </form>
  );
}