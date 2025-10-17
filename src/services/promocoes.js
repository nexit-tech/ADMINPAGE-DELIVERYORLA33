import { supabase } from './lib/supabase';

// ------------------------------------
// Serviço de Promoções (Modelo de Tabela Única com JSONB)
// ------------------------------------

// Transforma o formato do frontend para o formato do DB (inclui o campo JSONB)
const mapToDB = (promocao) => ({
    nome: promocao.nome,
    descricao: promocao.descricao,
    validade: promocao.validade || null,
    valor_total: promocao.valor_total || null,
    // CRÍTICO: Armazena a lista de itens como JSONB
    itens_json: promocao.itens, 
});

// Transforma o formato do DB para o formato do frontend (extrai o campo JSONB)
const mapToFrontend = (dbData) => ({
    ...dbData,
    id: dbData.id,
    valor_total: parseFloat(dbData.valor_total) || null,
    // CRÍTICO: Extrai o JSONB para a propriedade 'itens'
    itens: dbData.itens_json || [], 
});


export async function buscarTodasPromocoes() {
  const { data, error } = await supabase
    .from('promocoes')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    console.error('Erro ao buscar promoções:', error);
    return [];
  }
  
  // Mapeia cada item do DB para o formato esperado pelo frontend
  return data.map(mapToFrontend);
}

export async function adicionarPromocao(promocao) {
  const dadosDB = mapToDB(promocao);
    
  const { data, error } = await supabase
    .from('promocoes')
    .insert([dadosDB])
    .select();
  
  if (error) {
    console.error('Erro ao adicionar promoção:', error);
    return null;
  }
  
  return data ? mapToFrontend(data[0]) : null;
}

export async function atualizarPromocao(promocao) {
  const dadosDB = mapToDB(promocao);
  
  const { data, error } = await supabase
    .from('promocoes')
    .update(dadosDB)
    .eq('id', promocao.id)
    .select();

  if (error) {
    console.error('Erro ao atualizar promoção:', error);
    return null;
  }

  return data ? mapToFrontend(data[0]) : null;
}

export async function deletarPromocao(id) {
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