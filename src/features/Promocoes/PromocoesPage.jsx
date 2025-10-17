import React, { useState, useEffect } from 'react';
import styles from './Promocoes.module.css';
import PromocaoForm from './PromocaoForm';
import { buscarTodasPromocoes, adicionarPromocao, atualizarPromocao, deletarPromocao } from '../../services/promocoes';

function PromocoesPage() {
  const [promocoes, setPromocoes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [promocaoToEdit, setPromocaoToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Função de Carregamento de Dados
  const loadPromocoes = async () => {
    setLoading(true);
    const data = await buscarTodasPromocoes();
    if (data) {
      setPromocoes(data);
    } else {
      alert('Falha ao carregar promoções.');
    }
    setLoading(false);
  };

  // Chama o carregamento na montagem do componente
  useEffect(() => {
    loadPromocoes();
  }, []);

  // 2. Função para Abrir o Formulário de Edição
  const handleEdit = (promocao) => {
    setPromocaoToEdit(promocao);
    setIsFormOpen(true);
  };

  // 3. Função para Deletar Promoção
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta promoção?')) {
      const success = await deletarPromocao(id);
      if (success) {
        // Atualiza a lista sem recarregar a página inteira
        setPromocoes(promocoes.filter(p => p.id !== id));
        alert('Promoção deletada com sucesso!');
      } else {
        alert('Erro ao deletar promoção. Tente novamente.');
      }
    }
  };

  // 4. Função para Salvar (Adicionar ou Atualizar)
  const handleSave = async (promocaoData) => {
    let result = null;
    
    // Indica que o componente está carregando (evita cliques múltiplos e mostra feedback)
    setLoading(true); 

    if (promocaoData.id) {
      // ATUALIZAR
      result = await atualizarPromocao(promocaoData);
      if (result) {
        setPromocoes(promocoes.map(p => (p.id === result.id ? result : p)));
      }
    } else {
      // ADICIONAR
      result = await adicionarPromocao(promocaoData);
      if (result) {
        // Adiciona a nova promoção ao topo da lista
        setPromocoes([result, ...promocoes]); 
      }
    }
    
    setLoading(false); // Fim do carregamento
    
    if (result) {
      alert(`Promoção ${promocaoData.id ? 'atualizada' : 'adicionada'} com sucesso!`);
      // Fecha o formulário e limpa o estado de edição
      setIsFormOpen(false);
      setPromocaoToEdit(null);
    } else {
      alert('Erro ao salvar promoção. Verifique o console para mais detalhes.');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setPromocaoToEdit(null);
  };

  // 5. Helper para formatar itens para exibição (CORREÇÃO AQUI)
  const formatItens = (itens) => {
      if (!itens || itens.length === 0) return 'Nenhum item';
      
      return itens.slice(0, 3).map(item => {
          // CORREÇÃO: Trata preco_ajustado como 0 se for null/undefined/NaN antes de toFixed
          const preco = (item.preco_ajustado !== null && item.preco_ajustado !== undefined) 
              ? `R$${parseFloat(item.preco_ajustado).toFixed(2)}` 
              : 'Grátis';
              
          return `${item.produto_nome || item.produto} (${item.quantidade}x, ${preco})`;
      }).join('; ') + (itens.length > 3 ? '...' : '');
  };

  // 6. Renderização do Módulo de Promoções
  if (isFormOpen) {
    return (
      <PromocaoForm 
        promocao={promocaoToEdit} 
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    );
  }

  return (
    <div className={styles.promocoesContainer}>
      <h1 className={styles.pageTitle}>Gerenciamento de Promoções</h1>

      <div className={styles.header}>
        <button className={styles.addButton} onClick={() => setIsFormOpen(true)}>
          + Nova Promoção
        </button>
      </div>

      <div className={styles.listContainer}>
        {loading ? (
          <p className={styles.loadingMessage}>Carregando promoções...</p>
        ) : promocoes.length === 0 ? (
          <p className={styles.emptyMessage}>Nenhuma promoção encontrada.</p>
        ) : (
          <ul className={styles.promocoesList}>
            {promocoes.map(promocao => (
              <li key={promocao.id} className={styles.promocaoItem}>
                <div className={styles.promocaoInfo}>
                  <h3 className={styles.promocaoNome}>{promocao.nome}</h3>
                  <p className={styles.promocaoDescricao}>{promocao.descricao}</p>
                  
                  {promocao.valor_total && (
                      // Garante que o valor total seja exibido com duas casas decimais
                      <p className={styles.infoText}>Preço Fixo: R${parseFloat(promocao.valor_total).toFixed(2)}</p> 
                  )}
                  {promocao.validade && (
                    <p className={styles.promocaoValidade}>Validade: {promocao.validade}</p>
                  )}
                  
                  <ul className={styles.promocaoItens}>
                      <li>Itens: {formatItens(promocao.itens)}</li>
                  </ul>
                  
                </div>

                <div className={styles.promocaoActions}>
                  <button className={styles.editButton} onClick={() => handleEdit(promocao)}>
                    Editar
                  </button>
                  <button className={styles.deleteButton} onClick={() => handleDelete(promocao.id)}>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PromocoesPage;