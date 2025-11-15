import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from './cardapio.module.css';
// 1. CAMINHOS CORRIGIDOS
import CategoryList from '../../components/cardapio/CategoryList';
import ProductList from '../../components/cardapio/ProductList';
import ComboList from '../../components/cardapio/ComboList'; 
import Modal from '../../components/Modal';
import ProductForm from '../../components/cardapio/ProductForm';
import ComboForm from '../../components/cardapio/ComboForm'; 
// ---
import { supabase } from '../../lib/supabaseClient';

export default function CardapioPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('promocoes');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false); 
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCombo, setEditingCombo] = useState(null); 

  async function fetchCardapioData(isInitialLoad = false, newSelectedId = null) {
    if (isInitialLoad) setLoading(true);
    
    try {
      // 1. Busca Categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData);

      // 2. Busca Produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');
      if (productsError) throw productsError;
      setProducts(productsData);

      // 3. Busca Combos (com aninhamento)
      const { data: combosData, error: combosError } = await supabase
        .from('combos')
        .select(`
          *,
          combo_groups (
            id, name,
            combo_group_items (
              id, additional_price,
              products (id, name, price)
            )
          )
        `);
      if (combosError) throw combosError;
      
      const formattedCombos = combosData.map(combo => ({
        ...combo,
        groups: combo.combo_groups.map(group => ({
          group_id: group.id,
          name: group.name,
          items: group.combo_group_items
            .filter(item => item.products) 
            .map(item => ({
              productId: item.products.id, 
              name: item.products.name,
              additionalPrice: item.additional_price,
              combo_group_item_id: item.id
            }))
        }))
      }));
      setCombos(formattedCombos);
      
      if (newSelectedId) {
        setSelectedId(newSelectedId);
      } else if (selectedId !== 'promocoes' && !categoriesData.find(c => c.id === selectedId)) {
         setSelectedId('promocoes');
      }

    } catch (error) {
      console.error('Erro ao buscar dados do Supabase:', error.message);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }

  useEffect(() => {
    fetchCardapioData(true);
  }, []);
  
  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleAddCategory = async () => {
    const newName = prompt('Nome da nova categoria:');
    if (!newName) return;
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: newName })
        .select()
        .single();
      if (error) throw error;
      await fetchCardapioData(false, data.id); 
    } catch (error) {
      console.error('Erro ao criar categoria:', error.message);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Tem certeza que quer excluir a categoria "${name}"? Todos os produtos nela serão perdidos.`)) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      await fetchCardapioData(false, 'promocoes'); 
    } catch (error) {
      console.error('Erro ao deletar categoria:', error.message);
    }
  };

  const handleSaveProduct = async (formData) => {
    setIsProductModalOpen(false);
    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(formData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const newProductData = { ...formData, category_id: selectedId };
        const { error } = await supabase.from('products').insert(newProductData);
        if (error) throw error;
      }
      await fetchCardapioData(false, selectedId); 
    } catch (error) {
      console.error('Erro ao salvar produto:', error.message);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Tem certeza que quer excluir o produto "${name}"?`)) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await fetchCardapioData(false, selectedId); 
    } catch (error) {
      console.error('Erro ao deletar produto:', error.message);
    }
  };

  const handleSaveCombo = async (formData) => {
    setIsComboModalOpen(false);
    
    const cleanFormData = {
      name: formData.name,
      basePrice: formData.basePrice,
      id: typeof formData.id === 'string' ? formData.id : null, 
      groups: formData.groups.map(g => ({
        id: typeof g.group_id === 'string' ? g.group_id : null, 
        name: g.name,
        items: g.items 
      }))
    };
    
    try {
      const { error } = await supabase.rpc('upsert_combo', { 
        p_combo_data: cleanFormData 
      });
      if (error) throw error;
      
      await fetchCardapioData(false, 'promocoes');
    } catch (error) {
      console.error('Erro ao salvar promoção:', error.message);
      alert('Falha ao salvar a promoção.');
    }
  };

  const handleDeleteCombo = async (id, name) => {
    if (!window.confirm(`Tem certeza que quer excluir a promoção "${name}"?`)) return;
    try {
      const { error } = await supabase.from('combos').delete().eq('id', id);
      if (error) throw error;
      await fetchCardapioData(false, 'promocoes');
    } catch (error) {
      console.error('Erro ao deletar promoção:', error.message);
    }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <>
      <Head>
        <title>Cardápio - Delivery Orla33</title>
      </Head>
      <main className={styles.container}>
        {!loading && (
          <CategoryList
            categories={categories}
            selectedId={selectedId}
            onSelect={handleSelect}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
        
        {loading ? (
          <div className={styles.loading}>Carregando cardápio...</div>
        ) : selectedId === 'promocoes' ? (
          <ComboList
            combos={combos}
            onAddCombo={() => {
              setEditingCombo(null);
              setIsComboModalOpen(true);
            }}
            onEditCombo={(combo) => {
              setEditingCombo(combo);
              setIsComboModalOpen(true);
            }}
            onDeleteCombo={handleDeleteCombo}
          />
        ) : (
          <ProductList
            title={categories.find(c => c.id === selectedId)?.name || 'Produtos'}
            products={products.filter(p => p.category_id === selectedId)}
            disableAdd={false}
            onAddProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(product) => {
              setEditingProduct(product);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </main>

      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
      >
        <ProductForm 
          onSubmit={handleSaveProduct}
          initialData={editingProduct || {}}
        />
      </Modal>

      <Modal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        title={editingCombo ? 'Editar Promoção' : 'Criar Nova Promoção'}
      >
        <ComboForm
          allProducts={products}
          allCategories={categories}
          initialData={editingCombo || {}}
          onSubmit={handleSaveCombo}
        />
      </Modal>
    </>
  );
}