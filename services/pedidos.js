import { supabase } from '../lib/supabaseClient';

// ------------------------------------
// Serviço de Pedidos (Kanban)
// ------------------------------------

// 1. CRIÁMOS ESTA FUNÇÃO HELPER (AUXILIAR)
// Ela traduz os dados do banco (PWA) para o formato do painel (Admin)
export const formatarPedido = (p) => {
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
    shipping_address: p.shipping_address, // Adiciona o endereço completo
  }
};

// 2. FUNÇÃO ATUALIZADA (agora usa o helper)
export async function buscarTodosPedidos() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, profile_id, items, total_price, status, shipping_address, payment_method, created_at')
    .not('status', 'in', '("completed", "cancelled")')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }
  
  // 3. USA O HELPER PARA MAPEAR OS DADOS
  return data.map(formatarPedido);
}

// 4. FUNÇÕES DE MOVER E DELETAR (permanecem iguais)
export async function moverPedido(id, novoStatus) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: novoStatus })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erro ao mover pedido:', error);
    return false;
  }
  return true;
}

export async function deletarPedido(id) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar pedido:', error);
    return false;
  }
  return true;
}