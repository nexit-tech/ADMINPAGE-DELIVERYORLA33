import { supabase } from './lib/supabase';

// ------------------------------------
// Serviço de Promoções (Complexo)
// ------------------------------------

export async function buscarTodasPromocoes() {
  const { data: promocoesData, error: promocoesError } = await supabase
    .from('promocoes')
    .select('*, itens:promocao_itens(*)') // Busca a promoção e seus itens em uma única query
    .order('criado_em', { ascending: false });

  if (promocoesError) {
    console.error('Erro ao buscar promoções:', promocoesError);
    return [];
  }
  
  // Mapeia para garantir a formatação de preço nos itens
  return promocoesData.map(promocao => ({
    ...promocao,
    itens: promocao.itens.map(item => ({
      ...item,
      preco_ajustado: parseFloat(item.preco_ajustado),
    })),
  }));
}

export async function adicionarPromocao(promocao) {
  // 1. Inserir o Cabeçalho da Promoção
  const { itens, ...promocaoHeader } = promocao;
  
  const { data: headerData, error: headerError } = await supabase
    .from('promocoes')
    .insert([promocaoHeader])
    .select();
  
  if (headerError) {
    console.error('Erro ao adicionar cabeçalho da promoção:', headerError);
    return null;
  }
  
  const novaPromocaoId = headerData[0].id;
  
  // 2. Inserir os Itens da Promoção (vinculados ao novo ID)
  const itensFormatados = itens.map(item => ({
    promocao_id: novaPromocaoId,
    produto_nome: item.produto,
    preco_ajustado: item.preco,
    quantidade: item.quantidade,
  }));

  const { data: itensData, error: itensError } = await supabase
    .from('promocao_itens')
    .insert(itensFormatados)
    .select();

  if (itensError) {
    // Em um sistema robusto, faríamos um rollback aqui
    console.error('Erro ao adicionar itens da promoção:', itensError);
    return null;
  }

  return { ...headerData[0], itens: itensData };
}

export async function atualizarPromocao(promocao) {
  // 1. Atualizar o Cabeçalho da Promoção
  const { itens, ...promocaoHeader } = promocao;
  
  const { error: headerError } = await supabase
    .from('promocoes')
    .update(promocaoHeader)
    .eq('id', promocao.id);

  if (headerError) {
    console.error('Erro ao atualizar cabeçalho da promoção:', headerError);
    return null;
  }

  // 2. Sincronizar Itens: Deletar todos os antigos e inserir os novos
  const { error: deleteError } = await supabase
    .from('promocao_itens')
    .delete()
    .eq('promocao_id', promocao.id);
  
  if (deleteError) {
    console.error('Erro ao deletar itens antigos:', deleteError);
    return null;
  }

  const itensFormatados = itens.map(item => ({
    promocao_id: promocao.id,
    produto_nome: item.produto,
    preco_ajustado: item.preco,
    quantidade: item.quantidade,
  }));

  const { data: itensData, error: itensError } = await supabase
    .from('promocao_itens')
    .insert(itensFormatados)
    .select();

  if (itensError) {
    console.error('Erro ao reinserir novos itens:', itensError);
    return null;
  }

  return { ...promocaoHeader, itens: itensData };
}

export async function deletarPromocao(id) {
  // Devido ao ON DELETE CASCADE no SQL, deletar o cabeçalho deleta os itens.
  const { error } = await supabase
    .from('promocoes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar promoção:', error);
    return false;
  }
  return true;
}