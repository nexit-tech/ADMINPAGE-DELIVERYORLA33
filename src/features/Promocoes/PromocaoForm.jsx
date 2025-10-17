import React, { useState, useEffect } from 'react';
import styles from './PromocaoForm.module.css';
import { buscarTodosGrupos, buscarTodosProdutos } from '../../services/produtos';

function PromocaoForm({ promocao, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: promocao?.id || null,
    nome: promocao?.nome || '',
    descricao: promocao?.descricao || '',
    itens: promocao?.itens || [], 
    valor_total: promocao?.valor_total || '',
  });

  const [grupos, setGrupos] = useState([]);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]); 
  const [selectedGroupId, setSelectedGroupId] = useState(''); 
  const [loadingDados, setLoadingDados] = useState(true);
  
  // Estado para armazenar temporariamente o preço/quantidade dos itens que ainda não foram adicionados
  const [tempItemData, setTempItemData] = useState({});

  // 1. Carregar Grupos e Produtos ao iniciar
  useEffect(() => {
    const loadData = async () => {
      const [gruposData, produtosData] = await Promise.all([
          buscarTodosGrupos(),
          buscarTodosProdutos()
      ]);
      
      setGrupos(gruposData);
      setProdutosDisponiveis(produtosData);
      setLoadingDados(false);
    };
    loadData();
  }, []);
  
  // 2. Lógica para preencher o formulário ao editar (itens)
  useEffect(() => {
    if (promocao && promocao.itens && promocao.itens.length > 0) {
      setFormData({
        ...promocao,
        itens: promocao.itens.map(item => ({
            ...item,
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

  // 3. Editar Preço/Quantidade de Itens na Lista Final
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.itens];
    
    newItems[index][name] = (name === 'preco' || name === 'preco_ajustado') ? (parseFloat(value) || value) : (parseInt(value) || value);

    if (name === 'preco') {
        newItems[index]['preco_ajustado'] = (parseFloat(value) || value);
    }
    
    setFormData({ ...formData, itens: newItems });
  };

  // 4. Lógica para editar o preço/quantidade dos itens AINDA NA LISTA DE SELEÇÃO
  const handleTempItemChange = (produtoId, name, value, originalPrice) => {
    const parsedValue = (name === 'preco' || name === 'preco_ajustado') ? (parseFloat(value) || value) : (parseInt(value) || value);

    setTempItemData(prevData => ({
        ...prevData,
        [produtoId]: {
            ...prevData[produtoId],
            [name]: parsedValue,
            preco: prevData[produtoId]?.preco || originalPrice,
            quantidade: prevData[produtoId]?.quantidade || 1
        }
    }));
  };

  // 5. Lógica para ADICIONAR TODOS OS PRODUTOS DO GRUPO (Bulk Action)
  const handleAddGroupProducts = () => {
      const selectedGroup = grupos.find(g => g.id === parseInt(selectedGroupId));
      if (!selectedGroup) return;

      const produtosDoGrupo = produtosFiltrados; // Produtos atualmente visíveis e filtrados
      
      const novosItens = produtosDoGrupo.map(produto => {
          // Verifica se o produto já está na lista final (para não duplicar)
          const isAlreadyAdded = formData.itens.some(item => (item.produto_nome || item.produto) === produto.nome);
          if (isAlreadyAdded) return null; // Ignora se já foi adicionado

          const tempDetails = tempItemData[produto.id] || {};

          return {
              produto: produto.nome,
              produto_nome: produto.nome,
              preco: tempDetails.preco || produto.preco,
              quantidade: tempDetails.quantidade || 1,
              preco_ajustado: tempDetails.preco || produto.preco,
              // Adiciona informações do grupo para a separação visual no frontend
              grupo_id: selectedGroup.id,
              grupo_nome: selectedGroup.nome,
          };
      }).filter(item => item !== null); // Remove itens duplicados

      if (novosItens.length > 0) {
          setFormData({
              ...formData,
              // Adiciona novos itens e mantém a lista ordenada por nome para melhor UX
              itens: [...formData.itens, ...novosItens].sort((a, b) => a.produto.localeCompare(b.produto)),
          });
          alert(`Grupo '${selectedGroup.nome}' adicionado com sucesso.`);
      } else if (produtosDoGrupo.length > 0) {
          alert('Todos os itens deste grupo já estão na promoção.');
      } else {
          alert('Nenhum produto para adicionar neste grupo.');
      }
  };

  // 6. Remover Item da Promoção (Lista Final)
  const handleRemoveItem = (index) => {
    const newItems = formData.itens.filter((_, i) => i !== index);
    setFormData({ ...formData, itens: newItems });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dadosFormatados = {
        ...formData,
        valor_total: parseFloat(formData.valor_total) || null,
        itens: formData.itens.map(item => ({
            ...item,
            produto: item.produto_nome || item.produto,
            preco: parseFloat(item.preco_ajustado || item.preco) || 0,
            quantidade: parseInt(item.quantidade) || 1,
            // Remove grupo_id e grupo_nome, pois o backend espera apenas os campos do DB (promocao_itens)
            // Mantendo a estrutura para compatibilidade com o backend
        }))
    };
    
    onSave(dadosFormatados);
  };

  const formTitle = promocao ? 'Editar Promoção' : 'Adicionar Nova Promoção';
  const submitButtonText = promocao ? 'Salvar Alterações' : 'Adicionar Promoção';

  // Produtos filtrados pelo grupo selecionado no dropdown
  const produtosFiltrados = produtosDisponiveis.filter(p => p.grupo_id === parseInt(selectedGroupId));
  
  // NOVO: Função para agrupar os itens da promoção por nome do grupo para a renderização
  const groupItemsByGroup = (items) => {
    const grouped = items.reduce((acc, item) => {
        const groupName = item.grupo_nome || 'Outros Itens';
        acc[groupName] = acc[groupName] || [];
        acc[groupName].push(item);
        return acc;
    }, {});
    
    return Object.keys(grouped).map(groupName => ({
        groupName,
        items: grouped[groupName]
    }));
  };
  const itensAgrupadosParaExibicao = groupItemsByGroup(formData.itens);


  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>{formTitle}</h2>
      <form onSubmit={handleSubmit}>
        {/* CAMPOS PRINCIPAIS */}
        <div className={styles.formGroup}>
          <label htmlFor="nome">Nome da Promoção</label>
          <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} className={styles.inputField} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} className={styles.textareaField} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="valor_total">Valor da Promoção (Opcional - Preço Fixo)</label>
          <input type="number" id="valor_total" name="valor_total" value={formData.valor_total} onChange={handleChange} className={styles.inputField} step="0.01" placeholder="Ex: 59.90 (para preço fixo)" />
        </div>
        
        {/* SELETOR DE GRUPOS E PRODUTOS */}
        <h3 className={styles.sectionTitle}>1. Produtos Disponíveis no Catálogo</h3>
        
        {loadingDados && <p className={styles.loadingMessage}>Carregando grupos e produtos...</p>}

        <div className={styles.groupProductSelector}>
            {/* SELETOR DE GRUPO */}
            <div className={styles.groupSelectorWrapper}>
                <label className={styles.groupSelectorLabel}>Grupo de Produtos:</label>
                <select
                    className={styles.selectField}
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    disabled={loadingDados}
                >
                    <option value="">{loadingDados ? 'Carregando Grupos...' : 'Selecione um Grupo'}</option>
                    {grupos.map(grupo => (
                        <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                    ))}
                </select>
                
                {selectedGroupId && (
                    <button type="button" onClick={handleAddGroupProducts} className={styles.addGroupButton}>
                        Adicionar Grupo
                    </button>
                )}
            </div>
            
            {/* LISTA DE PRODUTOS FILTRADOS */}
            {selectedGroupId && (
                <div className={styles.productListArea}>
                    <h4 className={styles.productListTitle}>Produtos de {grupos.find(g => g.id === parseInt(selectedGroupId))?.nome || '...'}</h4>
                    
                    {produtosFiltrados.length > 0 ? (
                        <ul className={styles.productListSelector}>
                            {produtosFiltrados.map(produto => {
                                const isAdded = formData.itens.some(item => item.produto_nome === produto.nome);
                                const currentTempData = tempItemData[produto.id] || {};
                                
                                return (
                                    <li key={produto.id} className={`${styles.productItemSelect} ${isAdded ? styles.productItemAdded : ''}`}>
                                        <span className={styles.productSelectName}>{produto.nome}</span>
                                        
                                        <input 
                                            type="number" 
                                            name="quantidade" 
                                            defaultValue={isAdded ? undefined : currentTempData.quantidade || 1}
                                            onChange={(e) => handleTempItemChange(produto.id, 'quantidade', e.target.value, produto.preco)} 
                                            min="1" 
                                            placeholder="Qtd" 
                                            className={styles.tempItemQuantity}
                                            disabled={isAdded}
                                        />
                                        
                                        <input 
                                            type="number" 
                                            name="preco" 
                                            defaultValue={isAdded ? undefined : currentTempData.preco || produto.preco.toFixed(2)}
                                            onChange={(e) => handleTempItemChange(produto.id, 'preco', e.target.value, produto.preco)} 
                                            step="0.01" 
                                            placeholder="R$" 
                                            className={styles.tempItemPrice}
                                            disabled={isAdded}
                                        />
                                        
                                        {isAdded && <span className={styles.addedTag}>Adicionado</span>}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className={styles.emptyMessage}>Nenhum produto neste grupo.</p>
                    )}
                </div>
            )}
        </div>
        
        {/* LISTA FINAL DE ITENS DA PROMOÇÃO (AGRUPADA POR CATEGORIA) */}
        <h3 className={styles.sectionTitle}>2. Itens da Promoção (Lista Final Editável)</h3>
        {formData.itens.length === 0 && <p className={styles.emptyMessage}>Nenhum item adicionado à promoção.</p>}
        
        <div className={styles.finalItemList}>
            {itensAgrupadosParaExibicao.map(grupoItem => (
                <div key={grupoItem.groupName} className={styles.finalGroupSection}>
                    <h4 className={styles.finalGroupHeader}>Grupo - {grupoItem.groupName}</h4>
                    
                    {grupoItem.items.map((item, index) => {
                        // Encontra o índice real do item no array formData.itens para o handleItemChange funcionar
                        const originalIndex = formData.itens.findIndex(i => i.produto === item.produto); 
                        
                        return (
                            <div key={item.produto} className={styles.itemGroup}>
                                <span className={styles.productFinalName}>{item.produto_nome || item.produto}</span>
                                
                                <input type="number" name="quantidade" value={item.quantidade} onChange={(e) => handleItemChange(originalIndex, e)} min="1" placeholder="Qtd." className={styles.itemQuantity} required />
                                <input type="number" name="preco" value={item.preco_ajustado || item.preco} onChange={(e) => handleItemChange(originalIndex, e)} step="0.01" placeholder="Preço (R$)" className={styles.itemPrice} />
                                <button type="button" onClick={() => handleRemoveItem(originalIndex)} className={styles.removeButton}>Remover</button>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>{submitButtonText}</button>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default PromocaoForm;