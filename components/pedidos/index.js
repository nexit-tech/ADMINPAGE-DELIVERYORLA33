import React, { useState, useEffect } from 'react';
import styles from './pedidos.module.css';
// 1. CAMINHOS CORRIGIDOS (agora apontam para a pasta 'components' na raiz)
import OrderColumn from '../../components/pedidos/OrderColumn';
import OrderCard from '../../components/pedidos/OrderCard';
// ---
import { supabase } from '../../lib/supabaseClient'; 
import { buscarTodosPedidos, moverPedido, deletarPedido, formatarPedido } from '../../services/pedidos'; 

function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarPedidos = async () => {
    setLoading(true);
    const dados = await buscarTodosPedidos();
    setPedidos(dados);
    setLoading(false);
  };

  useEffect(() => {
    carregarPedidos();

    const subscription = supabase
      .channel('admin-pedidos-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: 'status=eq.pending'
        },
        (payload) => {
          console.log('Novo pedido recebido!', payload.new);
          const novoPedidoFormatado = formatarPedido(payload.new);
          setPedidos((currentPedidos) => {
            if (currentPedidos.some(p => p.id === novoPedidoFormatado.id)) {
              return currentPedidos;
            }
            return [novoPedidoFormatado, ...currentPedidos];
          });
        }
      )
      .subscribe(); 

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const getProximoStatus = (statusAtual) => {
      if (statusAtual === 'Novo') return 'preparing';
      if (statusAtual === 'Em preparo') return 'delivering';
      if (statusAtual === 'Em entrega') return 'completed';
      return statusAtual;
  };

  const handleMoverPedido = async (id) => {
    const pedido = pedidos.find(p => p.id === id);
    if (!pedido) return;
    
    const novoStatus = getProximoStatus(pedido.status);
    
    const sucesso = await moverPedido(id, novoStatus);
    if (sucesso) {
        const statusDisplayMap = {
          'preparing': 'Em preparo',
          'delivering': 'Em entrega',
          'completed': 'Finalizado'
        };
        
        if(novoStatus === 'completed') {
          setPedidos(pedidos.filter(p => p.id !== id));
        } else {
          setPedidos(pedidos.map(p =>
              p.id === id ? { ...p, status: statusDisplayMap[novoStatus] } : p
          ));
        }
    } else {
        alert('Erro ao atualizar o status do pedido.');
    }
  };

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

  const novosPedidos = pedidos.filter(p => p.status === 'Novo');
  const pedidosEmPreparo = pedidos.filter(p => p.status === 'Em preparo');
  const pedidosEmEntrega = pedidos.filter(p => p.status === 'Em entrega');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
        <p>Carregando pedidos...</p>
      </div>
    );
  }
  
  return (
    <div className={styles.mainContainer}>
        <OrderColumn title="Novos Pedidos" count={novosPedidos.length}>
          {novosPedidos.map(pedido => (
            <OrderCard
              key={pedido.id}
              pedido={{
                id: pedido.id,
                clientName: pedido.cliente_nome,
                address: `${pedido.shipping_address?.street || 'Rua não inf.'}, ${pedido.shipping_address?.number || 's/n'}`,
                items: pedido.itens.map(item => `${item.quantity}x ${item.product.name}`),
                status: 'novo' 
              }}
              onAccept={handleMoverPedido}
              onRefuse={handleRecusarPedido}
            />
          ))}
        </OrderColumn>
        
        <OrderColumn title="Em Preparo" count={pedidosEmPreparo.length}>
          {pedidosEmPreparo.map(pedido => (
             <OrderCard
              key={pedido.id}
              pedido={{
                id: pedido.id,
                clientName: pedido.cliente_nome,
                address: `${pedido.shipping_address?.street || 'Rua não inf.'}, ${pedido.shipping_address?.number || 's/n'}`,
                items: pedido.itens.map(item => `${item.quantity}x ${item.product.name}`),
                status: 'producao'
              }}
              onSend={handleMoverPedido}
            />
          ))}
        </OrderColumn>

        <OrderColumn title="Em Entrega" count={pedidosEmEntrega.length}>
          {pedidosEmEntrega.map(pedido => (
            <OrderCard
              key={pedido.id}
              pedido={{
                id: pedido.id,
                clientName: pedido.cliente_nome,
                address: `${pedido.shipping_address?.street || 'Rua não inf.'}, ${pedido.shipping_address?.number || 's/n'}`,
                items: pedido.itens.map(item => `${item.quantity}x ${item.product.name}`),
                status: 'entrega'
              }}
              onFinish={handleMoverPedido}
            />
          ))}
        </OrderColumn>
    </div>
  );
}

export default PedidosPage;