import React, { useState, useEffect } from 'react';
import styles from './PromocaoForm.module.css';

function PromocaoForm({ promocao, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: promocao?.id || null,
    nome: promocao?.nome || '',
    descricao: promocao?.descricao || '',
    itens: promocao?.itens || [{ produto: '', preco: '', quantidade: '' }],
    validade: promocao?.validade || '',
  });

  useEffect(() => {
    // Adiciona o valor padrão do preço ajustado do banco para o campo 'preco' do formulário
    if (promocao && promocao.itens.length > 0) {
      setFormData({
        ...promocao,
        itens: promocao.itens.map(item => ({
            ...item,
            // Usa 'preco_ajustado' do DB e mapeia para 'preco' no formulário
            preco: item.preco_ajustado !== undefined ? item.preco_ajustado : item.preco
        }))
      });
    }
  }, [promocao]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.itens];
    
    // Converte Preço/Quantidade para o tipo correto se o nome do campo for um deles
    newItems[index][name] = (name === 'preco' || name === 'quantidade') ? (parseFloat(value) || value) : value;

    setFormData({ ...formData, itens: newItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { produto: '', preco: '', quantidade: '' }],
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.itens.filter((_, i) => i !== index);
    setFormData({ ...formData, itens: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Formata os dados antes de enviar para o Save (que chamará o Supabase)
    const dadosFormatados = {
        ...formData,
        itens: formData.itens.map(item => ({
            ...item,
            // No DB, o nome do produto é 'produto_nome' e o preço é 'preco_ajustado'
            produto: item.produto_nome || item.produto,
            preco: parseFloat(item.preco),
            quantidade: parseInt(item.quantidade),
        }))
    };
    
    onSave(dadosFormatados);
  };

  const formTitle = promocao ? 'Editar Promoção' : 'Adicionar Nova Promoção';
  const submitButtonText = promocao ? 'Salvar Alterações' : 'Adicionar Promoção';

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>{formTitle}</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="nome">Nome da Promoção</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className={styles.textareaField}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="validade">Validade</label>
          <input
            type="text"
            id="validade"
            name="validade"
            value={formData.validade}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>

        <h3 className={styles.sectionTitle}>Itens da Promoção</h3>
        {formData.itens.map((item, index) => (
          <div key={index} className={styles.itemGroup}>
            <input
              type="text"
              name="produto"
              value={item.produto_nome || item.produto}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Nome do Produto/Grupo"
              className={styles.inputField}
              required
            />
            <input
              type="number"
              name="quantidade"
              value={item.quantidade}
              onChange={(e) => handleItemChange(index, e)}
              min="1"
              placeholder="Qtd."
              className={styles.itemQuantity}
              required
            />
            <input
              type="number"
              name="preco"
              value={item.preco_ajustado || item.preco}
              onChange={(e) => handleItemChange(index, e)}
              step="0.01"
              placeholder="Preço (R$)"
              className={styles.itemPrice}
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className={styles.removeButton}
            >
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className={styles.addItemButton}
        >
          Adicionar Outro Item
        </button>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>{submitButtonText}</button>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default PromocaoForm;