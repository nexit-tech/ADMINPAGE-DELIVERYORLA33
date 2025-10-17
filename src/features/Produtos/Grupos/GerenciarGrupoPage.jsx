import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './GerenciarGrupo.module.css';
import { 
    buscarTodosGrupos, 
    buscarProdutosPorGrupo, 
    adicionarProduto, 
    atualizarProduto, 
    deletarProduto,
    buscarTodosProdutos // Necessário para a função de vincular
} from '../../../services/produtos';

function GerenciarGrupoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const grupo_id = parseInt(id);
  
  const [grupo, setGrupo] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Lista de todos os produtos para vincular
  const [loading, setLoading] = useState(true);
  const [isLinkingVisible, setIsLinkingVisible] = useState(false); // Estado para abrir o seletor

  // Estado para edição de preço
  const [editingId, setEditingId] = useState(null);
  const [novoPreco, setNovoPreco] = useState('');
  const inputRef = useRef(null);

  // 1. Carregar Dados do Grupo e Produtos
  const carregarDadosDoGrupo = async () => {
    setLoading(true);
    
    const todosGrupos = await buscarTodosGrupos();
    const grupoEncontrado = todosGrupos.find(g => g.id === grupo_id);
    setGrupo(grupoEncontrado);

    const dadosProdutos = await buscarProdutosPorGrupo(grupo_id);
    setProdutos(dadosProdutos);
    
    // Carrega todos os produtos para a funcionalidade de Vincular
    const allProds = await buscarTodosProdutos();
    setAllProducts(allProds);

    setLoading(false);
  };

  useEffect(() => {
    carregarDadosDoGrupo();
  }, [id]);

  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);


  // 2. Lógica para Vincular / Desvincular Produtos (Unlinking/Linking)
  // Ação: Define o grupo_id de um produto como o grupo atual (link) ou NULL (unlink)
  const handleToggleLink = async (produto, link) => {
    const updatedProductData = {
        ...produto,
        grupo_id: link ? grupo_id : null,
    };
    
    const atualizado = await atualizarProduto(updatedProductData);

    if (atualizado) {
        // Recarrega apenas os produtos do grupo para refletir a mudança
        carregarDadosDoGrupo(); 
    }
  };


  // 3. Adicionar um novo produto (Create) - Mantido para criar novos itens
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    const newProduct = {
      nome: e.target.nome.value,
      preco: parseFloat(e.target.preco.value),
      grupo_id: grupo_id,
    };

    const produtoAdicionado = await adicionarProduto(newProduct);
    
    if (produtoAdicionado) {
      setProdutos([...produtos, { ...produtoAdicionado, grupo_nome: grupo.nome }]); 
      e.target.reset();
    }
  };

  // 4. Remover do Grupo (Unlink) - Substitui a função de deletar produto
  const handleRemoveFromGroup = (produto) => {
    if (window.confirm('Tem certeza que deseja remover este produto APENAS deste grupo? Ele não será deletado do seu catálogo.')) {
        handleToggleLink(produto, false); // Desvincula
    }
  };
  
  // 5. Salvar a edição de preço (Update)
  const handleSavePrice = async (produtoId) => {
    const produtoAntigo = produtos.find(p => p.id === produtoId);
    if (!produtoAntigo) return;

    const produtoAtualizado = {
      id: produtoId,
      preco: parseFloat(novoPreco),
      // Preserva outras colunas
      nome: produtoAntigo.nome,
      descricao: produtoAntigo.descricao,
      imagem_url: produtoAntigo.imagem_url,
      disponivel: produtoAntigo.disponivel,
      grupo_id: produtoAntigo.grupo_id
    };

    const atualizado = await atualizarProduto(produtoAtualizado);

    if (atualizado) {
      setProdutos(produtos.map(p =>
        p.id === atualizado.id ? { ...atualizado, preco: parseFloat(atualizado.preco) } : p
      ));
    } else {
        alert('Falha ao atualizar o preço.');
    }

    setEditingId(null);
    setNovoPreco('');
  };

  // Funções de visualização/renderização
  if (loading) {
    return <p className={styles.loadingMessage}>Carregando dados do grupo...</p>;
  }
  
  if (!grupo) {
    return (
      <div className={styles.containerNotFound}>
        <h1 className={styles.notFoundTitle}>Grupo não encontrado.</h1>
        <button onClick={() => navigate('/produtos/grupos')} className={styles.backButton}>
          Voltar para Grupos
        </button>
      </div>
    );
  }

  // Componente Seletor de Produtos para Vincular (Inline para simplicidade)
  const ProductSelector = () => {
    const produtosNaoVinculados = allProducts.filter(p => p.grupo_id !== grupo_id);

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.listHeader}>
                <h2 className={styles.sectionTitle}>Vincular Produtos Existentes</h2>
                <button 
                    onClick={() => setIsLinkingVisible(false)} 
                    className={styles.backButton}
                >
                    Fechar
                </button>
            </div>
            
            <ul className={styles.productList}>
                {produtosNaoVinculados.length === 0 ? (
                    <p className={styles.emptyMessage}>Todos os produtos estão vinculados ou não há mais produtos.</p>
                ) : (
                    produtosNaoVinculados.map(produto => (
                        <li key={produto.id} className={styles.productItem}>
                            <span className={styles.productName}>{produto.nome}</span>
                            <button 
                                className={styles.linkButton} 
                                onClick={() => handleToggleLink(produto, true)}
                            >
                                Vincular ao Grupo
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
  };

  return (
    <div className={styles.gerenciarContainer}>
      <h1 className={styles.gerenciarTitle}>Gerenciar Grupo: {grupo.nome}</h1>

      {isLinkingVisible && <ProductSelector />}
      
      <div className={styles.sectionContainer}>
        <h2 className={styles.sectionTitle}>Adicionar Novo Produto</h2>
        <form onSubmit={handleAddProduct} className={styles.addProductForm}>
          <input type="text" name="nome" placeholder="Nome do Produto" required className={styles.inputField} />
          <input type="number" name="preco" placeholder="Preço" step="0.01" required className={styles.inputField} />
          <button type="submit" className={styles.addButton}>Adicionar Novo</button>
        </form>
        
        <button onClick={() => setIsLinkingVisible(true)} className={styles.linkExistingButton}>
            Vincular Produtos Existentes ({allProducts.filter(p => p.grupo_id !== grupo_id).length} disponíveis)
        </button>
      </div>

      {/* Lista de Produtos do Grupo */}
      <div className={styles.sectionContainer}>
        <div className={styles.listHeader}>
          <h2 className={styles.sectionTitle}>Produtos do Grupo</h2>
          <span className={styles.productCount}>{produtos.length} produtos</span>
        </div>
        {produtos.length === 0 ? (
          <p className={styles.emptyMessage}>Nenhum produto neste grupo.</p>
        ) : (
          <ul className={styles.productList}>
            {produtos.map(produto => (
              <li key={produto.id} className={styles.productItem}>
                <span className={styles.productName}>{produto.nome}</span>
                {editingId === produto.id ? (
                  <div className={styles.priceEditContainer}>
                    <input
                      type="number"
                      value={novoPreco}
                      onChange={(e) => setNovoPreco(e.target.value)}
                      onBlur={() => handleSavePrice(produto.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePrice(produto.id);
                      }}
                      ref={inputRef}
                      className={styles.priceInput}
                      step="0.01"
                    />
                  </div>
                ) : (
                  <span
                    onClick={() => {
                      setEditingId(produto.id);
                      setNovoPreco(produto.preco);
                    }}
                    className={styles.productPrice}
                  >
                    R$ {produto.preco.toFixed(2)}
                  </span>
                )}
                <button
                  className={styles.deleteButton}
                  onClick={() => handleRemoveFromGroup(produto)}
                >
                  Remover do Grupo
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={() => navigate('/produtos/grupos')} className={styles.backButton}>
        Voltar para Grupos
      </button>
    </div>
  );
}

export default GerenciarGrupoPage;