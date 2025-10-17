import React, { useState, useEffect } from 'react';
import styles from './Configuracoes.module.css';
import { buscarConfiguracoes, salvarConfiguracoes } from '../../services/configuracoes';

// Dados mock para permissões são mantidos, pois não criamos a tabela de usuários/permissões no DB
const permissoesMock = [
  { id: 1, nome: 'Admin', permissao: 'administrador' },
  { id: 2, nome: 'Gerente', permissao: 'gerente' },
  { id: 3, nome: 'Usuário', permissao: 'usuario' },
];

// Mapeia os nomes do formulário/estado para os nomes das colunas do DB
const mapToState = (dbConfig) => ({
    nomeLoja: dbConfig.nome_loja || '',
    logoUrl: dbConfig.logo_url || '',
    horarioAbertura: dbConfig.horario_abertura || '18:00',
    horarioFechamento: dbConfig.horario_fechamento || '23:00',
    integracoes: {
        whatsapp: dbConfig.integracao_whatsapp || false,
        gatewayPagamento: dbConfig.integracao_gateway_pagamento || false,
    }
});

function ConfiguracoesPage() {
  const [configuracoes, setConfiguracoes] = useState({});
  const [permissoes, setPermissoes] = useState(permissoesMock);
  const [integracoes, setIntegracoes] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. Carregar Configurações
  const carregarConfiguracoes = async () => {
    const dadosDB = await buscarConfiguracoes();
    
    if (dadosDB) {
        // Mapeia os dados do DB para o estado do componente
        const configState = mapToState(dadosDB);
        
        setConfiguracoes(configState);
        setIntegracoes(configState.integracoes);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarConfiguracoes();
  }, []);
  
  // Mapeia os dados do estado para as colunas do DB antes de salvar
  const mapToDB = () => ({
    nome_loja: configuracoes.nomeLoja,
    logo_url: configuracoes.logoUrl,
    horario_abertura: configuracoes.horarioAbertura,
    horario_fechamento: configuracoes.horarioFechamento,
    integracao_whatsapp: integracoes.whatsapp,
    integracao_gateway_pagamento: integracoes.gatewayPagamento,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfiguracoes({
      ...configuracoes,
      [name]: value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const dadosParaSalvar = mapToDB();
    
    const resultado = await salvarConfiguracoes(dadosParaSalvar);

    if (resultado) {
        alert('Configurações salvas com sucesso!');
    } else {
        alert('Erro ao salvar configurações.');
    }
    setLoading(false);
  };
  
  const handleToggleIntegracao = (name) => {
    setIntegracoes(prev => {
        const newState = { ...prev, [name]: !prev[name] };
        return newState;
    });
  };
  
  const handleAddPermissao = (e) => {
    e.preventDefault();
    const newPermissao = {
      id: Math.random(),
      nome: e.target.nome.value,
      permissao: e.target.permissao.value,
    };
    setPermissoes([...permissoes, newPermissao]);
    e.target.reset();
  };
  
  const handleRemovePermissao = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta permissão?')) {
      setPermissoes(permissoes.filter(p => p.id !== id));
    }
  };

  if (loading) {
    return <p className={styles.loadingMessage}>Carregando configurações...</p>;
  }

  return (
    <div className={styles.configuracoesContainer}>
      <h1 className={styles.pageTitle}>Configurações da Loja</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Dados da Loja</h2>
        <div className={styles.formGroup}>
          <label htmlFor="nomeLoja">Nome da Loja</label>
          <input
            type="text"
            id="nomeLoja"
            name="nomeLoja"
            value={configuracoes.nomeLoja || ''}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="logoUrl">URL da Logo</label>
          <input
            type="text"
            id="logoUrl"
            name="logoUrl"
            value={configuracoes.logoUrl || ''}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="horarioAbertura">Horário de Abertura</label>
          <input
            type="time"
            id="horarioAbertura"
            name="horarioAbertura"
            value={configuracoes.horarioAbertura || ''}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="horarioFechamento">Horário de Fechamento</label>
          <input
            type="time"
            id="horarioFechamento"
            name="horarioFechamento"
            value={configuracoes.horarioFechamento || ''}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
        <button onClick={handleSave} className={styles.saveButton}>Salvar Alterações</button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Integrações</h2>
        <div className={styles.integracoesList}>
          <div className={styles.integracaoItem}>
            <span>Integração com WhatsApp</span>
            <label className={styles.switch}>
              <input type="checkbox" checked={integracoes.whatsapp || false} onChange={() => handleToggleIntegracao('whatsapp')} />
              <span className={styles.slider}></span>
            </label>
          </div>
          <div className={styles.integracaoItem}>
            <span>Gateway de Pagamento</span>
            <label className={styles.switch}>
              <input type="checkbox" checked={integracoes.gatewayPagamento || false} onChange={() => handleToggleIntegracao('gatewayPagamento')} />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
      </div>
      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Permissões de Usuários (Mock)</h2>
        <form onSubmit={handleAddPermissao} className={styles.addPermissaoForm}>
          <input type="text" name="nome" placeholder="Nome do Usuário" required className={styles.inputField} />
          <select name="permissao" className={styles.inputField}>
            <option value="usuario">Usuário</option>
            <option value="gerente">Gerente</option>
            <option value="administrador">Administrador</option>
          </select>
          <button type="submit" className={styles.addButton}>Adicionar Permissão</button>
        </form>
        <ul className={styles.permissoesList}>
          {permissoes.map(p => (
            <li key={p.id} className={styles.permissaoItem}>
              <span>{p.nome} - ({p.permissao})</span>
              <button className={styles.removeButton} onClick={() => handleRemovePermissao(p.id)}>Remover</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ConfiguracoesPage;