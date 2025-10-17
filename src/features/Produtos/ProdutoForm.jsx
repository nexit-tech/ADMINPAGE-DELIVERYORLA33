import React, { useState, useEffect } from 'react';
import styles from './ProdutoForm.module.css';
import { buscarTodosGrupos } from '../../services/produtos'; // Importa a função para buscar grupos

function ProdutoForm({ product, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    id: product?.id || null,
    nome: product?.nome || '',
    descricao: product?.descricao || '',
    preco: product?.preco || '',
    imagem_url: product?.imagem_url || '',
    grupo_id: product?.grupo_id || '',
    disponivel: product?.disponivel !== undefined ? product.disponivel : true,
  });

  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);

  // Carrega os grupos para o select
  useEffect(() => {
    const carregarGrupos = async () => {
      const dados = await buscarTodosGrupos();
      setGrupos(dados);
      setLoadingGrupos(false);
    };
    carregarGrupos();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Converte o preço para formato numérico antes de salvar
    const dataToSend = {
      ...formData,
      preco: parseFloat(formData.preco),
      grupo_id: parseInt(formData.grupo_id),
    };

    onSave(dataToSend);
  };

  const formTitle = product ? 'Editar Produto' : 'Adicionar Novo Produto';
  const submitButtonText = product ? 'Salvar Alterações' : 'Adicionar Produto';

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>{formTitle}</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="nome">Nome do Produto</label>
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
          <label htmlFor="preco">Preço (R$)</label>
          <input
            type="number"
            id="preco"
            name="preco"
            value={formData.preco}
            onChange={handleChange}
            className={styles.inputField}
            step="0.01"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="grupo_id">Grupo</label>
          <select
            id="grupo_id"
            name="grupo_id"
            value={formData.grupo_id}
            onChange={handleChange}
            className={styles.selectField}
            required
            disabled={loadingGrupos}
          >
            <option value="">{loadingGrupos ? 'Carregando Grupos...' : 'Selecione um grupo'}</option>
            {grupos.map(grupo => (
              <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="imagem_url">URL da Imagem</label>
          <input
            type="text"
            id="imagem_url"
            name="imagem_url"
            value={formData.imagem_url}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
        
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="disponivel"
            name="disponivel"
            checked={formData.disponivel}
            onChange={handleChange}
          />
          <label htmlFor="disponivel">Produto Disponível</label>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>{submitButtonText}</button>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default ProdutoForm;