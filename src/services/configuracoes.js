import { supabase } from './lib/supabase';

// ------------------------------------
// Serviço de Configurações da Loja
// ------------------------------------

// Função para buscar as configurações (deve retornar apenas 1 linha)
export async function buscarConfiguracoes() {
  const { data, error } = await supabase
    .from('configuracoes_loja')
    .select('*')
    .eq('id', 1) // Busca sempre a única linha de configurações
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = linha não encontrada
    console.error('Erro ao buscar configurações:', error);
    return null;
  }
  
  // Retorna os dados, ou um objeto vazio se não for encontrado
  return data || {};
}

// Função para salvar/atualizar as configurações
export async function salvarConfiguracoes(config) {
  const dataToSave = {
    ...config,
    id: 1, // Força o UPSERT/UPDATE na linha 1
    ultima_atualizacao: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('configuracoes_loja')
    .upsert(dataToSave) // UPSERT: Insere se não existir, atualiza se existir
    .select();

  if (error) {
    console.error('Erro ao salvar configurações:', error);
    return null;
  }
  return data[0];
}