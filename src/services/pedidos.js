import { supabase } from './lib/supabase';

// ------------------------------------
// Serviço de Pedidos (Kanban)
// ------------------------------------

// Função para buscar todos os pedidos
export async function buscarTodosPedidos() {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }
  // Mapeia para garantir que 'total' seja um número
  return data.map(p => ({ 
    ...p, 
    total: parseFloat(p.total),
    // Garante que o JSONB seja um objeto para evitar erros no frontend
    itens_pedido_json: p.itens_pedido_json || [] 
  }));
}

// Função para ADICIONAR um novo pedido (usada pelo PedidoForm)
export async function adicionarPedido(pedidoData) {
  // A 'pedidoData' já contém o campo 'itens_pedido_json' pronto
  const { data, error } = await supabase
    .from('pedidos')
    .insert([
        {
            cliente_nome: pedidoData.cliente_nome || null,
            endereco_entrega: pedidoData.endereco_entrega || null,
            forma_pagamento: pedidoData.forma_pagamento,
            observacoes: pedidoData.observacoes || null,
            total: pedidoData.total,
            itens_pedido_json: pedidoData.itens_pedido_json,
            // O status é definido pelo DB como 'Novo'
        }
    ])
    .select();

  if (error) {
    console.error('Erro ao adicionar novo pedido:', error);
    return null;
  }
  
  // Retorna o novo pedido
  return data ? data[0] : null;
}


// Função para mover/atualizar o status do pedido
export async function moverPedido(id, novoStatus) {
  const { data, error } = await supabase
    .from('pedidos')
    .update({ status: novoStatus })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erro ao mover pedido:', error);
    return false;
  }
  return true;
}

// Função para deletar/recusar o pedido
export async function deletarPedido(id) {
  const { error } = await supabase
    .from('pedidos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar pedido:', error);
    return false;
  }
  return true;
}