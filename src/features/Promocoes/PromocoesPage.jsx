import React, { useState, useEffect } from 'react';
import styles from './Promocoes.module.css';
import PromocaoForm from './PromocaoForm';
import { buscarTodasPromocoes, adicionarPromocao, atualizarPromocao, deletarPromocao } from '../../services/promocoes';

function PromocoesPage() {
  const [promocoes, setPromocoes] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPromocao, setEditingPromocao] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Carregar Promoções
  const carregarPromocoes = async () => {
    setLoading(true);
    const dados = await buscarTodasPromocoes();
    setPromocoes(dados);
    setLoading(false);
  };

  useEffect(() => {
    carregarPromocoes();
  }, []);

  const handleAddPromocaoClick = () => {
    setEditingPromocao(null);
    setIsFormVisible(true);
  };

  const handleEditPromocao = (id) => {
    const promocaoToEdit = promocoes.find(p => p.id === id);
    setEditingPromocao(promocaoToEdit);
    setIsFormVisible(true);
  };

  const handleDeletePromocao = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta promoção?')) {
      const sucesso = await deletarPromocao(id);
      if (sucesso) {
        setPromocoes(promocoes.filter(p => p.id !== id));
      } else {
          alert('Erro ao deletar a promoção.');
      }
    }
  };

  const handleCancelForm = () => {
    setEditingPromocao(null);
    setIsFormVisible(false);
  };

  const handleSavePromocao = async (savedPromocao) => {
    setLoading(true);
    let resultado;

    if (savedPromocao.id) {
      // Lógica de edição
      resultado = await atualizarPromocao(savedPromocao);
      if (resultado) {
        setPromocoes(promocoes.map(p => (p.id === resultado.id ? resultado : p)));
      }
    } else {
      // Lógica de adição
      resultado = await adicionarPromocao(savedPromocao);
      if (resultado) {
        setPromocoes([...promocoes, resultado]);
      }
    }

    if (resultado) {
        setEditingPromocao(null);
        setIsFormVisible(false);
        setLoading(false);
    } else {
        alert('Erro ao salvar promoção.');
        setLoading(false);
    }
  };
  
  if (loading) {
    return <p className={styles.loadingMessage}>Carregando promoções...</p>;
  }

  return (
    <div className={styles.promocoesContainer}>
      <h1 className={styles.pageTitle}>Gerenciar Promoções</h1>
      {isFormVisible ? (
        <PromocaoForm
          promocao={editingPromocao}
          onSave={handleSavePromocao}
          onCancel={handleCancelForm}
        />
      ) : (
        <>
          <header className={styles.header}>
            <button onClick={handleAddPromocaoClick} className={styles.addButton}>
              Adicionar Nova Promoção
            </button>
          </header>
          <div className={styles.listContainer}>
            {promocoes.length === 0 ? (
              <p className={styles.emptyMessage}>Nenhuma promoção cadastrada ainda.</p>
            ) : (
              <ul className={styles.promocoesList}>
                {promocoes.map(promocao => (
                  <li key={promocao.id} className={styles.promocaoItem}>
                    <div className={styles.promocaoInfo}>
                      <h2 className={styles.promocaoNome}>{promocao.nome}</h2>
                      <p className={styles.promocaoDescricao}>{promocao.descricao}</p>
                      <span className={styles.promocaoValidade}>Validade: {promocao.validade}</span>
                      <ul className={styles.promocaoItens}>
                        {promocao.itens.map((item, index) => (
                          // Ajusta para usar os nomes de coluna do DB: produto_nome e preco_ajustado
                          <li key={index}>{item.quantidade}x {item.produto_nome} (R$ {item.preco_ajustado.toFixed(2)})</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.promocaoActions}>
                      <button className={styles.editButton} onClick={() => handleEditPromocao(promocao.id)}>Editar</button>
                      <button className={styles.deleteButton} onClick={() => handleDeletePromocao(promocao.id)}>Excluir</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PromocoesPage;