import { supabase } from './lib/supabase';

// ------------------------------------
// Serviço de Finanças (Baseado em Pedidos)
// ------------------------------------

export async function buscarTodasTransacoes() {
  const { data, error } = await supabase
    .from('orders') // APONTA PARA A TABELA CORRETA
    .select('id, total_price, payment_method, status, created_at') // USA OS NOMES REAIS DAS COLUNAS
    .or('status.eq.completed,status.eq.delivering,status.eq.preparing') // Pega apenas pedidos que foram aceites
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar transações financeiras:', error);
    return [];
  }
  
  // Mapeia para o formato que o frontend espera
  return data.map(t => ({
      id: t.id,
      valor: parseFloat(t.total_price), // Mapeia 'total_price' para 'valor'
      pagamento: t.payment_method, // Mapeia 'payment_method'
      status: t.status,
      // Extrai apenas a parte da data (YYYY-MM-DD)
      data: t.created_at ? t.created_at.substring(0, 10) : 'N/A'
  }));
}