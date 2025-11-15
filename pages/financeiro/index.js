import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from './financeiro.module.css';
import DatePickerRange from '../DatePickerRange';
// 1. CAMINHOS CORRIGIDOS
import KpiCard from '../../components/financeiro/KpiCard';
import OrdersTable from '../../components/financeiro/OrdersTable';
import PaymentBreakdown from '../../components/financeiro/PaymentBreakdown';
import ProductsSoldTable from '../../components/financeiro/ProductsSoldTable';
// ---
import { buscarTodasTransacoes } from '../../services/financeiro';
import { IoAnalyticsOutline, IoCartOutline, IoCashOutline, IoNewspaperOutline, IoCalendarOutline, IoPodiumOutline, IoDocumentTextOutline } from 'react-icons/io5';

const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FinanceiroPage() {
  const [view, setView] = useState('resumo');
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [productsSold, setProductsSold] = useState([]);
  const [kpis, setKpis] = useState({ total: 0, orders: 0, ticket: 0 });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  async function fetchFinancialData() {
    setLoading(true);
    const data = await buscarTodasTransacoes(); 
    setAllOrders(data);
    setFilteredOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchFinancialData();
  }, []);

  useEffect(() => {
    if (loading) return;
    let orders = allOrders;

    if (startDate && endDate) {
      const start = new Date(startDate.setHours(0, 0, 0, 0));
      const end = new Date(endDate.setHours(23, 59, 59, 999));
      
      orders = allOrders.filter(order => {
        const [day, month, year] = order.date.split('/');
        const orderDate = new Date(`${year}-${month}-${day}`);
        return orderDate >= start && orderDate <= end;
      });
    }
    
    setFilteredOrders(orders);

    const total = orders.reduce((sum, order) => sum + order.total, 0);
    const count = orders.length;
    const ticket = count > 0 ? total / count : 0;
    setKpis({ total, orders: count, ticket });

    const productMap = new Map();
    for (const order of orders) {
      for (const item of order.items) {
        const name = item.product.name;
        const quantity = item.quantity;
        const currentQty = productMap.get(name) || 0;
        productMap.set(name, currentQty + quantity);
      }
    }
    const productsArray = Array.from(productMap, ([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
    
    setProductsSold(productsArray);

  }, [dateRange, allOrders, loading]);


  const handleExport = () => {
    alert('Exportando relatório... (lógica a implementar)');
  };


  return (
    <>
      <Head>
        <title>Financeiro - Delivery Orla33</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>Financeiro</h1>
          <nav className={styles.tabs}>
            <button
              className={view === 'resumo' ? styles.active : ''}
              onClick={() => setView('resumo')}
            >
              <IoAnalyticsOutline /> Resumo
            </button>
            <button
              className={view === 'produtos' ? styles.active : ''}
              onClick={() => setView('produtos')}
            >
              <IoPodiumOutline /> Produtos Vendidos
            </button>
          </nav>
        </div>

        <div className={styles.controlsHeader}>
          <DatePickerRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
          />
          <button className={styles.exportButton} onClick={handleExport}>
            <IoDocumentTextOutline /> Exportar Relatório
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <p>Carregando dados financeiros...</p>
          </div>
        ) : (
          <div className={styles.content}>
            {view === 'resumo' && (
              <>
                <div className={styles.kpiGrid}>
                  <KpiCard
                    title="Faturamento Total"
                    value={formatCurrency(kpis.total)}
                    icon={<IoCashOutline />}
                  />
                  <KpiCard
                    title="Pedidos Pagos"
                    value={kpis.orders.toString()}
                    icon={<IoCartOutline />}
                  />
                  <KpiCard
                    title="Ticket Médio"
                    value={formatCurrency(kpis.ticket)}
                    icon={<IoAnalyticsOutline />}
                  />
                </div>
                <div className={styles.breakdownWrapper}>
                  <PaymentBreakdown orders={filteredOrders} />
                </div>
                <h2 className={styles.sectionTitle}>Pedidos no Período</h2>
                <OrdersTable orders={filteredOrders} />
              </>
            )}

            {view === 'produtos' && (
              <>
                <h2 className={styles.sectionTitle}>Produtos Mais Vendidos</h2>
                <ProductsSoldTable products={productsSold} />
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}