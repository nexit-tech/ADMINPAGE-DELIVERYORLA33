import { supabase } from './lib/supabase';

// ------------------------------------
// Serviço de Grupos de Produtos
// ------------------------------------

export async function buscarTodosGrupos() {
  const { data, error } = await supabase
    .from('grupos')
    .select('id, nome')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar grupos:', error);
    return [];
  }
  return data;
}

export async function adicionarGrupo(nome) {
  const { data, error } = await supabase
    .from('grupos')
    .insert([{ nome }])
    .select();

  if (error) {
    console.error('Erro ao adicionar grupo:', error);
    return null;
  }
  return data ? data[0] : null;
}

export async function atualizarGrupo(id, nome) {
  const { data, error } = await supabase
    .from('grupos')
    .update({ nome })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erro ao atualizar grupo:', error);
    return null;
  }
  return data ? data[0] : null;
}

export async function deletarGrupo(id) {
  const { error } = await supabase
    .from('grupos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar grupo:', error);
    return false;
  }
  return true;
}

// ------------------------------------
// Serviço de Produtos
// ------------------------------------

export async function buscarTodosProdutos() {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
  // Mapeia para garantir que 'preco' seja um número (caso o Supabase retorne como string)
  return data.map(p => ({ ...p, preco: parseFloat(p.preco) }));
}

export async function buscarProdutosPorGrupo(grupo_id) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*, grupos(nome)') // Busca produtos e o nome do grupo
    .eq('grupo_id', grupo_id)
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar produtos por grupo:', error);
    return [];
  }
  // Mapeia para garantir que 'preco' seja um número e inclui o nome do grupo
  return data.map(p => ({
    ...p, 
    preco: parseFloat(p.preco),
    grupo_nome: p.grupos ? p.grupos.nome : 'Sem Grupo'
  }));
}

export async function adicionarProduto(produto) {
  const { data, error } = await supabase
    .from('produtos')
    .insert([produto])
    .select();

  if (error) {
    console.error('Erro ao adicionar produto:', error);
    return null;
  }
  return data ? { ...data[0], preco: parseFloat(data[0].preco) } : null;
}

export async function atualizarProduto(produto) {
  const { data, error } = await supabase
    .from('produtos')
    .update({
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        imagem_url: produto.imagem_url,
        disponivel: produto.disponivel,
        grupo_id: produto.grupo_id
    })
    .eq('id', produto.id)
    .select();

  if (error) {
    console.error('Erro ao atualizar produto:', error);
    return null;
  }
  return data ? { ...data[0], preco: parseFloat(data[0].preco) } : null;
}

export async function deletarProduto(id) {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar produto:', error);
    return false;
  }
  return true;
}