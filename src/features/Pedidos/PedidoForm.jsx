import React, { useState, useEffect } from 'react';
import styles from './PedidoForm.module.css';
import { buscarTodosProdutos, buscarTodosGrupos } from '../../services/produtos';
import { buscarTodasPromocoes } from '../../services/promocoes';

function PedidoForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    cliente_nome: '',
    endereco_entrega: '',
    forma_pagamento: 'Dinheiro',
    observacoes: '',
    // Carrinho: armazena produtos e promoções selecionados
    itens: [], 
  });

  const [produtos, setProdutos] = useState([]);
  const [promocoes, setPromocoes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(''); // ID do produto/promoção selecionado
  const [selectedType, setSelectedType] = useState('produto'); // produto ou promocao
  const [loadingDados, setLoadingDados] = useState(true);

  // Carregar todos os dados necessários
  useEffect(() => {
    const loadData = async () => {
      const [produtosData, gruposData, promocoesData] = await Promise.all([
        buscarTodosProdutos(),
        buscarTodosGrupos(),
        buscarTodasPromocoes(),
      ]);

      setProdutos(produtosData);
      setGrupos(gruposData);
      setPromocoes(promocoesData);
      setLoadingDados(false);
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Adiciona produto ou promoção ao carrinho (item)
  const handleAddItem = () => {
    if (!selectedItemId) return;

    const isProduct = selectedType === 'produto';
    const itemSelecionado = isProduct
        ? produtos.find(p => p.id === parseInt(selectedItemId))
        : promocoes.find(p => p.id === parseInt(selectedItemId));

    if (itemSelecionado) {
      const newItem = {
        // Campos base
        id_unico: Date.now() + Math.random(), // ID para o React
        tipo: selectedType, 
        nome: isProduct ? itemSelecionado.nome : itemSelecionado.nome,

        // Preço e quantidade
        preco: isProduct ? itemSelecionado.preco : itemSelecionado.valor_total || 0, // Usa preço do produto ou valor fixo da promoção
        quantidade: 1, 

        // Detalhes extras (para salvar o JSONB completo da promoção)
        promocao_detalhes: isProduct ? null : itemSelecionado, 
      };

      setFormData({ ...formData, itens: [...formData.itens, newItem] });
      setSelectedItemId('');
    }
  };

  // Remove item do carrinho
  const handleRemoveItem = (id_unico) => {
    setFormData({
      ...formData,
      itens: formData.itens.filter(item => item.id_unico !== id_unico),
    });
  };

  // Edita a quantidade ou o preço de um item no carrinho
  const handleItemUpdate = (id_unico, field, value) => {
    setFormData({
      ...formData,
      itens: formData.itens.map(item =>
        item.id_unico === id_unico
          ? { ...item, [field]: parseFloat(value) || 0 }
          : item
      ),
    });
  };

  // Calcular o total final do pedido
  const calcularTotal = () => {
    return formData.itens.reduce((total, item) => {
      const subtotal = item.preco * item.quantidade;
      return total + subtotal;
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = calcularTotal();

    if (formData.itens.length === 0) {
        alert('Adicione pelo menos um item ao pedido.');
        return;
    }

    const pedidoFinal = {
      cliente_nome: formData.cliente_nome,
      endereco_entrega: formData.endereco_entrega,
      forma_pagamento: formData.forma_pagamento,
      observacoes: formData.observacoes,
      total: total,
      // Cria o JSONB de itens para o Supabase (garantindo apenas os dados necessários)
      itens_pedido_json: formData.itens.map(item => ({
        tipo: item.tipo,
        nome: item.nome,
        preco_final: item.preco,
        quantidade: item.quantidade,
        promocao_info: item.promocao_detalhes ? item.promocao_detalhes.id : null,
        // Adicione aqui todos os campos que você mapeia na sua tabela 'itens_pedido' se você a estivesse usando
      })),
    };

    onSave(pedidoFinal);
  };

  const totalPedido = calcularTotal();

  if (loadingDados) {
    return <div className={styles.loadingMessage}>Carregando produtos e promoções...</div>;
  }

  const itensDisponiveis = selectedType === 'produto' ? produtos : promocoes;


  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Registrar Novo Pedido Manual</h2>
      <form onSubmit={handleSubmit}>

        {/* INFORMAÇÕES DO CLIENTE */}
        <h3 className={styles.sectionTitle}>Dados do Cliente</h3>
        <div className={styles.dadosCliente}>
          <input type="text" name="cliente_nome" placeholder="Nome do Cliente" value={formData.cliente_nome} onChange={handleChange} className={styles.inputField} required />
          <input type="text" name="endereco_entrega" placeholder="Endereço de Entrega" value={formData.endereco_entrega} onChange={handleChange} className={styles.inputField} required />
          <select name="forma_pagamento" value={formData.forma_pagamento} onChange={handleChange} className={styles.selectField}>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Cartão">Cartão</option>
            <option value="PIX">PIX</option>
          </select>
        </div>
        <textarea name="observacoes" placeholder="Observações do Pedido" value={formData.observacoes} onChange={handleChange} className={styles.textareaField} rows="2" />

        {/* SELETOR DE ITENS (PRODUTO/PROMOÇÃO) */}
        <h3 className={styles.sectionTitle}>Adicionar Itens</h3>
        <div className={styles.itemSelector}>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className={styles.selectField}>
                <option value="produto">Produto</option>
                <option value="promocao">Promoção</option>
            </select>
            <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} className={styles.selectField} disabled={loadingDados}>
                <option value="">Selecione um {selectedType}</option>
                {itensDisponiveis.map(item => (
                    <option key={item.id} value={item.id}>
                        {item.nome}
                    </option>
                ))}
            </select>
            <button type="button" onClick={handleAddItem} className={styles.addItemButton} disabled={!selectedItemId}>
                Adicionar
            </button>
        </div>

        {/* LISTA DE ITENS NO CARRINHO */}
        <h3 className={styles.sectionTitle}>Carrinho ({formData.itens.length} itens)</h3>
        <div className={styles.cartListArea}>
          {formData.itens.length === 0 ? (
            <p className={styles.emptyMessage}>O pedido está vazio.</p>
          ) : (
            <ul className={styles.cartList}>
              {formData.itens.map(item => (
                <li key={item.id_unico} className={styles.cartItem}>
                  <span className={styles.itemName}>{item.nome} ({item.tipo === 'promocao' ? 'Promoção' : 'Produto'})</span>

                  <input
                    type="number"
                    name="quantidade"
                    value={item.quantidade}
                    onChange={(e) => handleItemUpdate(item.id_unico, 'quantidade', e.target.value)}
                    min="1"
                    className={styles.itemQuantity}
                  />

                  <input
                    type="number"
                    name="preco"
                    value={item.preco.toFixed(2)}
                    onChange={(e) => handleItemUpdate(item.id_unico, 'preco', e.target.value)}
                    step="0.01"
                    className={styles.itemPrice}
                  />

                  <span className={styles.itemSubtotal}>
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </span>

                  <button type="button" onClick={() => handleRemoveItem(item.id_unico)} className={styles.removeButton}>
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RODAPÉ E BOTÕES DE AÇÃO */}
        <div className={styles.orderSummary}>
          <span className={styles.totalLabel}>Total do Pedido:</span>
          <span className={styles.totalValue}>R$ {totalPedido.toFixed(2)}</span>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton} disabled={formData.itens.length === 0}>
            Registrar Pedido
          </button>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default PedidoForm;