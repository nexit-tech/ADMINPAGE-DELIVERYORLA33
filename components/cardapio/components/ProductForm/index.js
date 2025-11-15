import { useState, useEffect } from 'react';
import styles from './ProductForm.module.css';

export default function ProductForm({ onSubmit, initialData = {} }) {
  // Estados em camelCase (padrão do React)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  
  // --- NOVOS ESTADOS PARA IMAGEM ---
  const [imageFile, setImageFile] = useState(null); // O arquivo (File)
  const [imagePreview, setImagePreview] = useState(null); // A URL para o preview

  // Preenche o form quando 'initialData' (para edição) é carregado
  useEffect(() => {
    setName(initialData.name || '');
    setDescription(initialData.description || '');
    setPrice(initialData.price || '');
    setPromoPrice(initialData.promo_price || ''); 
    setImagePreview(initialData.image_url || null); // <-- Seta o preview da imagem existente
    setImageFile(null); // Limpa o arquivo
  }, [initialData]);

  // --- NOVA FUNÇÃO PARA ATUALIZAR O PREVIEW ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Cria um preview local
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = { 
      name, 
      description, 
      price: parseFloat(price) || 0,
      promo_price: parseFloat(promoPrice) || null
    };

    // Envia o formData E o imageFile (ou null)
    onSubmit(formData, imageFile);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      
      {/* --- NOVO CAMPO DE UPLOAD E PREVIEW --- */}
      <div className={styles.formGroup}>
        <label htmlFor="image">Foto do Produto</label>
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className={styles.previewImage} />
        )}
        <input
          id="image"
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleImageChange}
        />
      </div>
      
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
            value={promoPrice}
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