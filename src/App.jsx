import Navbar from './components/common/Navbar';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 

// Importe os componentes das páginas
import PedidosPage from './features/Pedidos/PedidosPage';
import ProdutosPage from './features/Produtos/ProdutosPage';
import PromocoesPage from './features/Promocoes/PromocoesPage';
import FinancasPage from './features/Financas/FinancasPage';
import ConfiguracoesPage from './features/Configuracoes/ConfiguracoesPage';
import AuthPage from './features/Auth/AuthPage'; 

// Componente simples para tela de carregamento
function LoadingMessage() {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--primary-color)', fontSize: '1.5em' }}>Carregando Painel...</div>;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
      // Exibe a mensagem de carregamento (curta, pois é mock)
      return <LoadingMessage />;
  }

  // Se o usuário não estiver logado, exibe a tela de Auth
  if (!user) {
      return <AuthPage />;
  }

  // Se o usuário estiver logado, exibe a aplicação principal
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<PedidosPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/produtos/*" element={<ProdutosPage />} />
          <Route path="/promocoes" element={<PromocoesPage />} />
          <Route path="/financas" element={<FinancasPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="*" element={<PedidosPage />} /> 
        </Routes>
      </div>
    </>
  );
}

export default App;