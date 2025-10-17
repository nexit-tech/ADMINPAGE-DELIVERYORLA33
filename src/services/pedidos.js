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
  return data.map(p => ({ ...p, total: parseFloat(p.total) }));
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