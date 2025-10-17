import React, { useState, useEffect } from 'react';
import styles from './Pedidos.module.css';
import { buscarTodosPedidos, moverPedido, deletarPedido } from '../../services/pedidos';

// Dados de exemplo SIMULADOS para itens, tempo e cliente, já que o Supabase só retorna o cabeçalho do pedido.
// Em um projeto real, esta informação viria da tabela 'itens_pedido' via JOIN.
const mockDetalhes = (pedido) => {
  if (pedido.id === 1) return { itens: ['Pizza Calabresa (grande)', 'Coca-Cola 2L'], tempo: '5 min' };
  if (pedido.id === 2) return { itens: ['Combo 1: Hambúrguer e Batata'], tempo: '25 min' };
  if (pedido.id === 3) return { itens: ['Pizza Margherita (média)'], tempo: '15 min' };
  if (pedido.id === 4) return { itens: ['Açaí 500ml', 'Sanduíche Natural'], tempo: '8 min' };
  return { itens: ['Item não listado'], tempo: '0 min' };
};


function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Carregar Pedidos ao iniciar a página (Read)
  const carregarPedidos = async () => {
    setLoading(true);
    const dados = await buscarTodosPedidos();
    // Adiciona os detalhes mockados aos dados do Supabase
    const pedidosComDetalhes = dados.map(pedido => ({
        ...pedido,
        ...mockDetalhes(pedido)
    }));
    setPedidos(pedidosComDetalhes);
    setLoading(false);
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  // Adiciona a lógica de status para determinar a próxima ação
  const getProximoStatus = (statusAtual) => {
      if (statusAtual === 'Novo') return 'Em preparo';
      if (statusAtual === 'Em preparo') return 'Em entrega';
      if (statusAtual === 'Em entrega') return 'Finalizado'; // Último estágio visível no Kanban
      return statusAtual;
  };

  // 2. Função para mover o pedido para a próxima coluna (Update)
  const handleMoverPedido = async (id, novoStatus) => {
    const sucesso = await moverPedido(id, novoStatus);
    if (sucesso) {
        setPedidos(pedidos.map(pedido =>
            pedido.id === id ? { ...pedido, status: novoStatus } : pedido
        ));
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

  // Filtra os pedidos para cada coluna
  const novosPedidos = pedidos.filter(p => p.status === 'Novo');
  const pedidosEmPreparo = pedidos.filter(p => p.status === 'Em preparo');
  const pedidosEmEntrega = pedidos.filter(p => p.status === 'Em entrega');


  const renderCard = (pedido) => (
    <div key={pedido.id} className={styles.pedidoCard}>
      <div className={styles.cardHeader}>
        <span className={styles.pedidoId}>Pedido #{pedido.id}</span>
        {/* Usar o status que veio do DB/State */}
        <span className={`${styles.statusBadge} ${styles[pedido.status.replace(/\s/g, '')]}`}>{pedido.status}</span>
      </div>
      <div className={styles.cardBody}>
        <h4 className={styles.clienteName}>{pedido.cliente_nome}</h4>
        <ul className={styles.itemList}>
          {/* Mapeia os itens mockados */}
          {pedido.itens.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.cardFooter}>
        <span>Total: <span className={styles.totalValue}>R$ {pedido.total.toFixed(2)}</span></span>
        <span>Pagamento: <span className={styles.paymentMethod}>{pedido.forma_pagamento}</span></span>
        {/* Adiciona o tempo decorrido - mockado */}
        <span>Tempo: {pedido.tempo}</span> 
      </div>
      <div className={styles.cardActions}>
        {pedido.status === 'Novo' && (
          <>
            <button
              className={styles.acceptButton}
              onClick={() => handleMoverPedido(pedido.id, getProximoStatus(pedido.status))} // Move para 'Em preparo'
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
            onClick={() => handleMoverPedido(pedido.id, getProximoStatus(pedido.status))} // Move para 'Em entrega'
          >
            Pronto para Entrega
          </button>
        )}
        {pedido.status === 'Em entrega' && (
          <button
            className={styles.finalizarButton} // Novo botão para finalizar
            onClick={() => handleMoverPedido(pedido.id, getProximoStatus(pedido.status))} // Move para 'Finalizado'
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