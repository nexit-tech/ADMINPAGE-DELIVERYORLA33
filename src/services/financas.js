import { supabase } from './lib/supabase';

// ------------------------------------
// Serviço de Finanças (Baseado em Pedidos)
// ------------------------------------

export async function buscarTodasTransacoes() {
  const { data, error } = await supabase
    .from('pedidos')
    .select('id, total, forma_pagamento, status, criado_em')
    .order('criado_em', { ascending: false });

  if (error) {
    console.error('Erro ao buscar transações financeiras:', error);
    return [];
  }
  
  // Mapeia para garantir que 'total' seja um número e formata a data para YYYY-MM-DD para os filtros
  return data.map(t => ({
      id: t.id,
      valor: parseFloat(t.total),
      pagamento: t.forma_pagamento,
      status: t.status,
      // Extrai apenas a parte da data (YYYY-MM-DD) para compatibilidade com o input type="date" do React
      data: t.criado_em ? t.criado_em.substring(0, 10) : 'N/A'
  }));
}