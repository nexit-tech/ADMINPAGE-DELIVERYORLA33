import React, { useState, useEffect } from 'react';
import styles from './Pedidos.module.css';
import { buscarTodosPedidos, moverPedido, deletarPedido } from '../../services/pedidos';

// 1. REMOVER A FUNÇÃO 'mockDetalhes' INTEIRA
/*
const mockDetalhes = (pedido) => {
  // ... (toda a função mock foi removida) ...
};
*/

function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Carregar Pedidos (Read)
  const carregarPedidos = async () => {
    setLoading(true);
    const dados = await buscarTodosPedidos();
    // 2. REMOVER A LINHA QUE ADICIONAVA MOCKS
    setPedidos(dados);
    setLoading(false);
  };

  useEffect(() => {
    carregarPedidos();
    
    // ATUALIZAÇÃO AUTOMÁTICA (OPCIONAL, MAS RECOMENDADO)
    // Recarrega os pedidos a cada 30 segundos
    const interval = setInterval(() => {
      carregarPedidos();
    }, 30000); // 30 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao sair da página
  }, []);

  // 3. ATUALIZAR 'getProximoStatus' para usar os status REAIS (inglês)
  // O 'statusAtual' que chega aqui já está em Português (Ex: "Novo", "Em preparo")
  const getProximoStatus = (statusAtual) => {
      if (statusAtual === 'Novo') return 'preparing';
      if (statusAtual === 'Em preparo') return 'delivering';
      if (statusAtual === 'Em entrega') return 'completed'; // 'completed' fará ele sumir do Kanban
      return statusAtual;
  };

  // 2. Função para mover o pedido (Update)
  const handleMoverPedido = async (id, novoStatus) => {
    const sucesso = await moverPedido(id, novoStatus);
    if (sucesso) {
        // Atualiza a lista local na hora para o UI responder
        const statusDisplayMap = {
          'preparing': 'Em preparo',
          'delivering': 'Em entrega',
          'completed': 'Finalizado' // Vai sumir do filtro
        };
        
        if(novoStatus === 'completed') {
          // Remove da lista se foi finalizado
          setPedidos(pedidos.filter(pedido => pedido.id !== id));
        } else {
          // Atualiza o status na lista
          setPedidos(pedidos.map(pedido =>
              pedido.id === id ? { ...pedido, status: statusDisplayMap[novoStatus] } : pedido
          ));
        }
    } else {
        alert('Erro ao atualizar o status do pedido.');
    }
  };

  // 3. Função para recusar/excluir o pedido (Delete)
  const handleRecusarPedido = async (id) => {
    if (window.confirm('Tem certeza que deseja recusar/excluir este pedido?')) {
        const sucesso = await deletarPedido(id);
        if (sucesso) {
            setPedidos(pedidos.filter(pedido => pedido.id !== id));
        } else {
            alert('Erro ao excluir o pedido.');
        }
    }
  };

  // Filtra os pedidos para cada coluna (usando os status em Português)
  const novosPedidos = pedidos.filter(p => p.status === 'Novo');
  const pedidosEmPreparo = pedidos.filter(p => p.status === 'Em preparo');
  const pedidosEmEntrega = pedidos.filter(p => p.status === 'Em entrega');


  const renderCard = (pedido) => (
    <div key={pedido.id} className={styles.pedidoCard}>
      <div className={styles.cardHeader}>
        <span className={styles.pedidoId}>Pedido #{pedido.id.substring(0, 8)}...</span>
        {/* Usa o status que veio do DB (ex: "Novo", "Em preparo") */}
        <span className={`${styles.statusBadge} ${styles[pedido.status.replace(/\s/g, '')]}`}>{pedido.status}</span>
      </div>
      <div className={styles.cardBody}>
        <h4 className={styles.clienteName}>{pedido.cliente_nome}</h4>
        
        {/* 4. RENDERIZAR OS ITENS REAIS DO JSONB */}
        <ul className={styles.itemList}>
          {pedido.itens.map((item) => (
            <li key={item.id}>
              {item.quantity}x {item.product.name}
            </li>
          ))}
          {/* Mostra observações se existirem */}
          {pedido.itens.some(item => item.observation) && (
            <li style={{ color: 'var(--primary-color)', marginTop: '5px' }}>
              <strong>Obs:</strong> {pedido.itens.find(item => item.observation)?.observation}
            </li>
          )}
        </ul>
      </div>
      <div className={styles.cardFooter}>
        <span>Total: <span className={styles.totalValue}>R$ {pedido.total.toFixed(2)}</span></span>
        <span>Pagamento: <span className={styles.paymentMethod}>{pedido.forma_pagamento}</span></span>
      </div>
      <div className={styles.cardActions}>
        {pedido.status === 'Novo' && (
          <>
            <button
              className={styles.acceptButton}
              onClick={() => handleMoverPedido(pedido.id, getProximoStatus(pedido.status))} // Move para 'preparing'
            >
              Aceitar
            </button>
            <button
              className={styles.declineButton}
              onClick={() => handleRecusarPedido(pedido.id)}
            >
              Recusar
            </button>
          </>
        )}
        {pedido.status === 'Em preparo' && (
          <button
            className={styles.readyButton}
            onClick={() => handleMoverPedido(pedido.id, getProximoStatus(pedido.status))} // Move para 'delivering'
          >
            Pronto para Entrega
          </button>
        )}
        {pedido.status === 'Em entrega' && (
          <button
            className={styles.finalizarButton}
            onClick={() => handleMoverPedido(pedido.id, getProximoStatus(pedido.status))} // Move para 'completed'
          >
            Finalizar Pedido
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <p className={styles.loadingMessage}>Carregando pedidos...</p>;
  }
  
  return (
    <div className={styles.kanbanContainer}>
      <h1 className={styles.pageTitle}>Gerenciamento de Pedidos</h1>
      <div className={styles.kanbanBoard}>
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>Novos Pedidos ({novosPedidos.length})</h2>
          {novosPedidos.map(renderCard)}
        </div>
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>Em Preparo ({pedidosEmPreparo.length})</h2>
          {pedidosEmPreparo.map(renderCard)}
        </div>
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>Em Entrega ({pedidosEmEntrega.length})</h2>
          {pedidosEmEntrega.map(renderCard)}
        </div>
      </div>
    </div>
  );
}

export default PedidosPage;