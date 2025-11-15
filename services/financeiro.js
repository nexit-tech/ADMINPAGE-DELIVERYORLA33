import { supabase } from '../lib/supabaseClient'; // Importa o ficheiro certo

// ------------------------------------
// Serviço de Finanças
// ------------------------------------

export async function buscarTodasTransacoes() {
  const { data, error } = await supabase
    .from('orders') // APONTA PARA A TABELA CORRETA
    .select('id, created_at, profile_id, items, total_price, status, shipping_address, payment_method')
    
    // --- CORREÇÃO AQUI ---
    // Adicionamos o 'status.eq.archived' na consulta
    .or('status.eq.completed,status.eq.delivering,status.eq.preparing,status.eq.archived') 
    
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar transações financeiras:', error);
    return [];
  }
  
  return data.map(t => ({
      id: t.id,
      date: t.created_at ? new Date(t.created_at).toLocaleDateString('pt-BR') : 'N/A',
      client: t.shipping_address?.name || 'Visitante',
      payment: t.payment_method, 
      total: parseFloat(t.total_price),
      status: t.status,
      items: t.items || []
  }));
}