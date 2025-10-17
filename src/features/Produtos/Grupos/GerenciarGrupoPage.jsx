import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './GerenciarGrupo.module.css';
import { buscarTodosGrupos, buscarProdutosPorGrupo, adicionarProduto, atualizarProduto, deletarProduto } from '../../../services/produtos';

function GerenciarGrupoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const grupo_id = parseInt(id); // ID do grupo atual
  
  const [grupo, setGrupo] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para edição de preço
  const [editingId, setEditingId] = useState(null);
  const [novoPreco, setNovoPreco] = useState('');
  const inputRef = useRef(null);

  // 1. Carregar Nome do Grupo e Produtos
  const carregarDadosDoGrupo = async () => {
    setLoading(true);
    
    // A. Buscar nome do grupo
    const todosGrupos = await buscarTodosGrupos();
    const grupoEncontrado = todosGrupos.find(g => g.id === grupo_id);
    setGrupo(grupoEncontrado);

    // B. Buscar produtos do Supabase
    const dadosProdutos = await buscarProdutosPorGrupo(grupo_id);
    setProdutos(dadosProdutos);
    
    setLoading(false);
  };

  useEffect(() => {
    carregarDadosDoGrupo();
  }, [id]);

  useEffect(() => {
    // Foca no input de preço quando o modo de edição é ativado
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);


  // 2. Adicionar um novo produto (Create)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    const newProduct = {
      nome: e.target.nome.value,
      preco: parseFloat(e.target.preco.value),
      grupo_id: grupo_id, // Vincula o produto ao ID do grupo atual
    };

    const produtoAdicionado = await adicionarProduto(newProduct);
    
    if (produtoAdicionado) {
      // Anexamos o nome do grupo para exibi-lo corretamente, pois a inserção não retorna o join.
      setProdutos([...produtos, { ...produtoAdicionado, grupo_nome: grupo.nome }]); 
      e.target.reset();
    }
  };

  // 3. Excluir um produto (Delete)
  const handleDeleteProduct = async (produtoId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto do grupo?')) {
      const sucesso = await deletarProduto(produtoId);
      if (sucesso) {
        setProdutos(produtos.filter(p => p.id !== produtoId));
      } else {
        alert('Falha ao excluir o produto.');
      }
    }
  };

  // 4. Salvar a edição de preço (Update)
  const handleSavePrice = async (produtoId) => {
    // Encontra o produto antigo para obter todas as informações necessárias para o update
    const produtoAntigo = produtos.find(p => p.id === produtoId);
    if (!produtoAntigo) return;

    const produtoAtualizado = {
      id: produtoId,
      preco: parseFloat(novoPreco),
      // Preserva outras colunas para o UPDATE
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

  // Renderiza o loading
  if (loading) {
    return <p className={styles.loadingMessage}>Carregando dados do grupo...</p>;
  }
  
  // Renderiza erro se o grupo não for encontrado
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

  return (
    <div className={styles.gerenciarContainer}>
      <h1 className={styles.gerenciarTitle}>Gerenciar Grupo: {grupo.nome}</h1>

      {/* Formulário de Adição de Produto */}
      <div className={styles.sectionContainer}>
        <h2 className={styles.sectionTitle}>Adicionar Novo Produto</h2>
        <form onSubmit={handleAddProduct} className={styles.addProductForm}>
          <input type="text" name="nome" placeholder="Nome do Produto" required className={styles.inputField} />
          <input type="number" name="preco" placeholder="Preço" step="0.01" required className={styles.inputField} />
          <button type="submit" className={styles.addButton}>Adicionar</button>
        </form>
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
                  onClick={() => handleDeleteProduct(produto.id)}
                >
                  Excluir
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