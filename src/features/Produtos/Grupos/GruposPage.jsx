import React, { useState, useEffect } from 'react';
import styles from './Grupos.module.css';
import { buscarTodosGrupos, adicionarGrupo, atualizarGrupo, deletarGrupo } from '../../../services/produtos'; // Importa as funções do Supabase

function GruposPage() {
  const [grupos, setGrupos] = useState([]);
  const [novoGrupo, setNovoGrupo] = useState('');
  const [editingGrupo, setEditingGrupo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Carregar Grupos ao iniciar a página
  const carregarGrupos = async () => {
    setLoading(true);
    const dados = await buscarTodosGrupos();
    setGrupos(dados);
    setLoading(false);
  };

  useEffect(() => {
    carregarGrupos();
  }, []);

  // 2. Adicionar Novo Grupo (Create)
  const handleAddGrupo = async (e) => {
    e.preventDefault();
    if (novoGrupo.trim() === '') return;

    const novo = await adicionarGrupo(novoGrupo.trim());
    if (novo) {
      setGrupos([...grupos, novo]);
      setNovoGrupo('');
    }
  };

  // 3. Atualizar Grupo Existente (Update)
  const handleUpdateGrupo = async (e) => {
    e.preventDefault();
    if (novoGrupo.trim() === '') return;

    const atualizado = await atualizarGrupo(editingGrupo.id, novoGrupo.trim());
    if (atualizado) {
      setGrupos(grupos.map(g =>
        g.id === atualizado.id ? atualizado : g
      ));
      setEditingGrupo(null);
      setNovoGrupo('');
    }
  };

  // 4. Deletar Grupo (Delete)
  const handleDeleteGrupo = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      const sucesso = await deletarGrupo(id);
      if (sucesso) {
        setGrupos(grupos.filter(grupo => grupo.id !== id));
      }
    }
  };

  // Lógica para iniciar o modo de edição
  const handleEditClick = (grupo) => {
    setEditingGrupo(grupo);
    setNovoGrupo(grupo.nome);
  };

  if (loading) {
    return <p className={styles.loadingMessage}>Carregando grupos...</p>;
  }

  return (
    <div className={styles.gruposContainer}>
      <h1 className={styles.pageTitle}>Gerenciar Grupos de Produtos</h1>

      <form className={styles.formContainer} onSubmit={editingGrupo ? handleUpdateGrupo : handleAddGrupo}>
        <input
          type="text"
          value={novoGrupo}
          onChange={(e) => setNovoGrupo(e.target.value)}
          placeholder={editingGrupo ? "Editar nome do grupo" : "Nome do novo grupo"}
          className={styles.inputField}
        />
        <button type="submit" className={styles.addButton}>
          {editingGrupo ? "Salvar Alterações" : "Adicionar Grupo"}
        </button>
        {editingGrupo && (
          <button type="button" className={styles.cancelButton} onClick={() => { setEditingGrupo(null); setNovoGrupo(''); }}>
            Cancelar
          </button>
        )}
      </form>

      <div className={styles.listContainer}>
        <h2 className={styles.listTitle}>Grupos Existentes</h2>
        <ul className={styles.gruposList}>
          {grupos.map(grupo => (
            <li key={grupo.id} className={styles.grupoItem}>
              <span>{grupo.nome}</span>
              <div className={styles.groupActions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditClick(grupo)}
                >
                  Editar
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteGrupo(grupo.id)}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default GruposPage;