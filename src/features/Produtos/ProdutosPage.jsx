import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import GruposPage from './Grupos/GruposPage';
import GerenciarGrupoPage from './Grupos/GerenciarGrupoPage';
import ProdutoForm from './ProdutoForm';
import ProdutoItem from './ProdutoItem';
import styles from './Produtos.module.css';
import { buscarTodosProdutos, deletarProduto, adicionarProduto, atualizarProduto } from '../../services/produtos'; // Importa as funções do Supabase

function ProdutosListagem({ produtos, onAddProductClick, onEdit, onDelete, loading }) {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Gerenciar Produtos</h1>
        <button
          className={styles.addButton}
          onClick={onAddProductClick}
        >
          Adicionar Novo Produto
        </button>
      </header>
      <div className={styles.listContainer}>
        <h3 className={styles.listTitle}>Lista de Produtos</h3>
        {loading ? (
          <p className={styles.loadingMessage}>Carregando produtos...</p>
        ) : produtos.length === 0 ? (
          <p className={styles.emptyMessage}>Nenhum produto cadastrado ainda.</p>
        ) : (
          <ul className={styles.produtosList}>
            {produtos.map(produto => (
              <ProdutoItem
                key={produto.id}
                produto={produto}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function ProdutosPage() {
  const location = useLocation();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar produtos do Supabase
  const carregarProdutos = async () => {
    setLoading(true);
    const dados = await buscarTodosProdutos();
    setProdutos(dados);
    setLoading(false);
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setIsFormVisible(true);
  };

  const handleCancelForm = () => {
    setEditingProduct(null);
    setIsFormVisible(false);
  };

  const handleEditProduct = (id) => {
    const produtoToEdit = produtos.find(p => p.id === id);
    setEditingProduct(produtoToEdit);
    setIsFormVisible(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const sucesso = await deletarProduto(id);
      if (sucesso) {
        setProdutos(produtos.filter(p => p.id !== id));
      }
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    const atualizado = await atualizarProduto(updatedProduct);
    if (atualizado) {
      setProdutos(produtos.map(p => p.id === atualizado.id ? atualizado : p));
      setEditingProduct(null);
      setIsFormVisible(false);
    }
  };

  const handleAddProduct = async (newProduct) => {
    // Retira o ID antes de enviar para o Supabase
    const { id, ...produtoSemId } = newProduct; 
    
    const novo = await adicionarProduto(produtoSemId);
    if (novo) {
      setProdutos([...produtos, novo]);
      setEditingProduct(null);
      setIsFormVisible(false);
    }
  };

  return (
    <div className={styles.produtosContainer}>
      <nav className={styles.navBarProdutos}>
        <ul className={styles.navList}>
          <li className={location.pathname === '/produtos' ? styles.navItemActive : ''}>
            <Link to="/produtos" className={styles.navLink}>Produtos</Link>
          </li>
          <li className={location.pathname.startsWith('/produtos/grupos') ? styles.navItemActive : ''}>
            <Link to="/produtos/grupos" className={styles.navLink}>Grupos</Link>
          </li>
        </ul>
      </nav>

      {isFormVisible ? (
        <ProdutoForm
          product={editingProduct}
          onCancel={handleCancelForm}
          onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
        />
      ) : (
        <Routes>
          <Route
            index
            element={
              <ProdutosListagem
                produtos={produtos}
                onAddProductClick={handleAddProductClick}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                loading={loading}
              />
            }
          />
          <Route path="grupos" element={<GruposPage />} />
          <Route path="grupos/:id" element={<GerenciarGrupoPage />} />
        </Routes>
      )}
    </div>
  );
}

export default ProdutosPage;