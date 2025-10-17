import Navbar from './components/common/Navbar';
import { Routes, Route } from 'react-router-dom';

// Importe os componentes das páginas
import PedidosPage from './features/Pedidos/PedidosPage';
import ProdutosPage from './features/Produtos/ProdutosPage';
import PromocoesPage from './features/Promocoes/PromocoesPage';
import FinancasPage from './features/Financas/FinancasPage';
import ConfiguracoesPage from './features/Configuracoes/ConfiguracoesPage'; // Importe a nova página

function App() {
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
          <Route path="/configuracoes" element={<ConfiguracoesPage />} /> {/* Corrigido: aponta para o componente real */}
        </Routes>
      </div>
    </>
  );
}

export default App;