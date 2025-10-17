import React, { useState, useEffect } from 'react';
import styles from './Financas.module.css';
import { buscarTodasTransacoes } from '../../services/financas'; // Importa o novo serviço

function FinancasPage() {
  const [dataFiltro, setDataFiltro] = useState('');
  const [pagamentoFiltro, setPagamentoFiltro] = useState('');
  const [transacoesOriginais, setTransacoesOriginais] = useState([]); // Guarda todos os dados do DB
  const [transacoesFiltradas, setTransacoesFiltradas] = useState([]); // Dados visíveis na tela
  const [loading, setLoading] = useState(true);

  // 1. Carregar Transações ao iniciar a página
  const carregarTransacoes = async () => {
    setLoading(true);
    const dados = await buscarTodasTransacoes();
    setTransacoesOriginais(dados);
    setTransacoesFiltradas(dados); // Inicializa a lista filtrada com todos os dados
    setLoading(false);
  };

  useEffect(() => {
    carregarTransacoes();
  }, []);

  // 2. Lógica de Filtragem (Executada a cada mudança de filtro)
  useEffect(() => {
    let filtradas = transacoesOriginais;

    if (dataFiltro) {
      filtradas = filtradas.filter(t => t.data === dataFiltro);
    }
    if (pagamentoFiltro) {
      filtradas = filtradas.filter(t => t.pagamento === pagamentoFiltro);
    }

    setTransacoesFiltradas(filtradas);
  }, [dataFiltro, pagamentoFiltro, transacoesOriginais]);


  // Função para formatar a data de 'YYYY-MM-DD' para 'DD/MM/YYYY'
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Função para exportar os dados para TXT
  const handleExportReport = () => {
    const header = 'Relatório de Transações\n\nData,Valor,Pagamento,Status\n';

    const txtContent = transacoesFiltradas.map(t =>
      `${formatarData(t.data)},R$ ${t.valor.toFixed(2)},${t.pagamento},${t.status}`
    ).join('\n');

    const fullTxt = header + txtContent;

    const blob = new Blob([fullTxt], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorio-financas.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lógica para o dashboard com base nos dados filtrados
  const totalVendas = transacoesFiltradas.reduce((sum, t) => sum + t.valor, 0);
  const quantidadePedidos = transacoesFiltradas.length;
  const ticketMedio = quantidadePedidos > 0 ? totalVendas / quantidadePedidos : 0;
  
  if (loading) {
    return <p className={styles.loadingMessage}>Carregando dados financeiros...</p>;
  }

  return (
    <div className={styles.financasContainer}>
      <h1 className={styles.pageTitle}>Área Financeira</h1>

      {/* Dashboard Resumido */}
      <div className={styles.dashboard}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total de Vendas</span>
          <span className={styles.metricValue}>R$ {totalVendas.toFixed(2)}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Quantidade de Pedidos</span>
          <span className={styles.metricValue}>{quantidadePedidos}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Ticket Médio</span>
          <span className={styles.metricValue}>R$ {ticketMedio.toFixed(2)}</span>
        </div>
      </div>

      {/* Filtros e Tabela de Detalhes */}
      <div className={styles.mainContent}>
        <div className={styles.filters}>
          <input
            type="date"
            className={styles.filterInput}
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={pagamentoFiltro}
            onChange={(e) => setPagamentoFiltro(e.target.value)}
          >
            <option value="">Forma de Pagamento</option>
            <option value="PIX">PIX</option>
            <option value="Cartão">Cartão</option>
            <option value="Dinheiro">Dinheiro</option>
          </select>
          <button onClick={handleExportReport} className={styles.exportButton}>Exportar Relatório</button>
        </div>

        <div className={styles.tableContainer}>
          <h2 className={styles.tableTitle}>Transações Detalhadas</h2>
          <table className={styles.transacoesTable}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Valor</th>
                <th>Pagamento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transacoesFiltradas.map(transacao => (
                <tr key={transacao.id}>
                  <td>{formatarData(transacao.data)}</td>
                  <td>R$ {transacao.valor.toFixed(2)}</td>
                  <td>{transacao.pagamento}</td>
                  <td>{transacao.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {transacoesFiltradas.length === 0 && (
            <p className={styles.emptyMessage}>Nenhuma transação encontrada para os filtros selecionados.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancasPage;