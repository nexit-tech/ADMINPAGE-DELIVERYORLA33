import { supabase } from './lib/supabase';

// ------------------------------------
// Serviço de Pedidos (Kanban)
// ------------------------------------

// 1. FUNÇÃO ATUALIZADA PARA BUSCAR DADOS REAIS
export async function buscarTodosPedidos() {
  const { data, error } = await supabase
    .from('orders') // APONTA PARA A TABELA CORRETA
    .select('id, profile_id, items, total_price, status, shipping_address, payment_method, created_at')
    .not('status', 'in', '("completed", "cancelled")') // Ignora pedidos finalizados/cancelados
    .order('created_at', { ascending: true }); // Mais antigos primeiro (FIFO)

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }
  
  // 2. MAPEIA OS DADOS REAIS DO PWA PARA O FORMATO QUE O ADMIN ESPERA
  return data.map(p => {
    let statusDisplay = p.status;
    
    // Mapeia os status do DB (inglês) para o Display (português)
    if (p.status === 'pending') statusDisplay = 'Novo';
    if (p.status === 'preparing') statusDisplay = 'Em preparo';
    if (p.status === 'delivering') statusDisplay = 'Em entrega';

    return {
      id: p.id,
      cliente_nome: p.shipping_address?.name || 'Visitante', // Pega o nome do JSON
      total: parseFloat(p.total_price), // Mapeia 'total_price' para 'total'
      forma_pagamento: p.payment_method, // Mapeia 'payment_method'
      status: statusDisplay, // Usa o status mapeado
      itens: p.items || [], // Pega os itens REAIS do JSONB
      // (created_at é usado para ordenar, não precisa mapear se não for exibir)
    }
  });
}

// 3. FUNÇÃO ATUALIZADA PARA MOVER O PEDIDO
export async function moverPedido(id, novoStatus) {
  const { data, error } = await supabase
    .from('orders') // APONTA PARA A TABELA CORRETA
    .update({ status: novoStatus }) // Salva o novo status (ex: 'preparing')
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erro ao mover pedido:', error);
    return false;
  }
  return true;
}

// 4. FUNÇÃO ATUALIZADA PARA DELETAR/RECUSAR
export async function deletarPedido(id) {
  const { error } = await supabase
    .from('orders') // APONTA PARA A TABELA CORRETA
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar pedido:', error);
    return false;
  }
  return true;
}