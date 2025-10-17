import React, { useState, useEffect } from 'react';
import styles from './Pedidos.module.css';
import PedidoForm from './PedidoForm'; // Importe o novo formulário
import { buscarTodosPedidos, moverPedido, deletarPedido, adicionarPedido } from '../../services/pedidos';

// Dados de exemplo SIMULADOS para itens, tempo e cliente, já que o Supabase só retorna o cabeçalho do pedido.
// Em um projeto real, esta informação viria da tabela 'itens_pedido' via JOIN.
const mockDetalhes = (pedido) => {
  // Usamos o campo 'itens_pedido_json' que já vem do DB para os itens
  const itensMapeados = (pedido.itens_pedido_json || []).map(item => 
      `${item.quantidade}x ${item.nome} (R$${item.preco_final.toFixed(2)})`
  );
  // O tempo deve ser calculado com base em 'criado_em', mas aqui mantemos o mock para simplificar
  return { itens: itensMapeados, tempo: '5 min' };
};


function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false); // Estado para o formulário

  // 1. Carregar Pedidos ao iniciar a página (Read)
  const carregarPedidos = async () => {
    setLoading(true);
    const dados = await buscarTodosPedidos();

    // Adiciona os detalhes mockados (e mapeia os itens do JSONB) aos dados do Supabase
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
        // Oculta pedidos finalizados da visualização ativa
        if (novoStatus === 'Finalizado') {
            setPedidos(pedidos.filter(p => p.id !== id));
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

  // 4. Função para Adicionar Pedido (Create)
  const handleAddPedido = async (pedidoData) => {
      setLoading(true);
      const novoPedidoDB = await adicionarPedido(pedidoData);

      if (novoPedidoDB) {
          const pedidoComDetalhes = {
              ...novoPedidoDB,
              ...mockDetalhes(novoPedidoDB),
              total: parseFloat(novoPedidoDB.total), // Garante que o total é número
          };
          setPedidos([pedidoComDetalhes, ...pedidos]);
          setIsFormOpen(false);
          alert('Pedido registrado com sucesso!');
      } else {
          alert('Falha ao registrar o pedido.');
      }
      setLoading(false);
  };


  // Filtra os pedidos para cada coluna
  const novosPedidos = pedidos.filter(p => p.status === 'Novo');
  const pedidosEmPreparo = pedidos.filter(p => p.status === 'Em preparo');
  const pedidosEmEntrega = pedidos.filter(p => p.status === 'Em entrega');


  const renderCard = (pedido) => (
    <div key={pedido.id} className={styles.pedidoCard}>
      <div className={styles.cardHeader}>
        <span className={styles.pedidoId}>Pedido #{pedido.id}</span>
        <span className={`${styles.statusBadge} ${styles[pedido.status.replace(/\s/g, '')]}`}>{pedido.status}</span>
      </div>
      <div className={styles.cardBody}>
        <h4 className={styles.clienteName}>{pedido.cliente_nome}</h4>
        <ul className={styles.itemList}>
          {pedido.itens.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.cardFooter}>
        <span>Total: <span className={styles.totalValue}>R$ {pedido.total.toFixed(2)}</span></span>
        <span>Pagamento: <span className={styles.paymentMethod}>{pedido.forma_pagamento}</span></span>
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

  if (isFormOpen) {
      return (
          <PedidoForm onSave={handleAddPedido} onCancel={() => setIsFormOpen(false)} />
      );
  }

  return (
    <div className={styles.kanbanContainer}>
      <header className={styles.kanbanHeader}>
        <h1 className={styles.pageTitle}>Gerenciamento de Pedidos</h1>
        <button onClick={() => setIsFormOpen(true)} className={styles.addButton}>
            + Adicionar Pedido Manual
        </button>
      </header>

      {loading ? (
        <p className={styles.loadingMessage}>Carregando pedidos...</p>
      ) : (
        <div className={styles.kanbanBoard}>
          <div className={styles.column}>
            <h2 className={styles.columnTitle}>Novos Pedidos ({novosPedidos.length})</h2>
            {novosPedidos.length === 0 && <p className={styles.emptyColumn}>Nenhum pedido novo.</p>}
            {novosPedidos.map(renderCard)}
          </div>
          <div className={styles.column}>
            <h2 className={styles.columnTitle}>Em Preparo ({pedidosEmPreparo.length})</h2>
            {pedidosEmPreparo.length === 0 && <p className={styles.emptyColumn}>Nenhum pedido em preparo.</p>}
            {pedidosEmPreparo.map(renderCard)}
          </div>
          <div className={styles.column}>
            <h2 className={styles.columnTitle}>Em Entrega ({pedidosEmEntrega.length})</h2>
            {pedidosEmEntrega.length === 0 && <p className={styles.emptyColumn}>Nenhum pedido em entrega.</p>}
            {pedidosEmEntrega.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  );
}

export default PedidosPage;