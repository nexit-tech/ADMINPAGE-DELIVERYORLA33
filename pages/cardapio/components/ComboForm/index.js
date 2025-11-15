import { useState } from 'react';
import styles from './ComboForm.module.css';
import { IoTrash, IoAdd, IoMenu } from 'react-icons/io5';
import StyledSelect from '../../../../components/StyledSelect';

// Imports da biblioteca DND-Kit (Core)
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

// Imports da biblioteca DND-Kit (Sortable)
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

// Imports da biblioteca DND-Kit (Utilities e Modifiers)
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// --- COMPONENTE INTERNO DO GRUPO (Item Arrastável) ---
function GroupEditor({ group, onUpdate, onRemove, provided, snapshot }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.group_id }); // <-- Usa o ID do grupo (group_id)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const preventEnter = (e) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  const handleUpdateItemPrice = (productId, newPrice) => {
    const newItems = group.items.map(item => 
      item.productId === productId ? { ...item, additionalPrice: parseFloat(newPrice) || 0 } : item
    );
    onUpdate({ ...group, items: newItems });
  };
  
  const handleRemoveItem = (productId) => {
    const newItems = group.items.filter(item => item.productId !== productId);
    onUpdate({ ...group, items: newItems });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.group} ${isDragging ? styles.isDragging : ''}`}
    >
      <div className={styles.groupHeader}>
        <div {...listeners} {...attributes} className={styles.dragHandle}>
          <IoMenu />
        </div>
        <h4 className={styles.groupName}>{group.name}</h4>
        <button 
          type="button" 
          onClick={onRemove} 
          className={styles.removeGroupButton}
        >
          <IoTrash />
        </button>
      </div>

      <div className={styles.itemsList}>
        {group.items.map(item => (
          <div key={item.productId} className={styles.item}>
            <span>{item.name}</span>
            <div className={styles.itemControls}>
              <label>+ R$</label>
              <input
                type="number"
                step="0.01"
                value={item.additionalPrice}
                onChange={(e) => handleUpdateItemPrice(item.productId, e.target.value)}
                onKeyDown={preventEnter}
              />
              <button 
                type="button"
                onClick={() => handleRemoveItem(item.productId)}
              >
                <IoTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// --- COMPONENTE PRINCIPAL DO FORMULÁRIO ---
export default function ComboForm({ 
  allProducts, 
  allCategories,
  initialData, // <-- O ID está aqui
  onSubmit 
}) {
  const [name, setName] = useState(initialData.name || '');
  const [basePrice, setBasePrice] = useState(initialData.basePrice || 0);
  const [groups, setGroups] = useState(initialData.groups || []);
  const [categoryToAdd, setCategoryToAdd] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const preventEnter = (e) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    setGroups((currentGroups) => {
      const oldIndex = currentGroups.findIndex(g => g.group_id === active.id);
      const newIndex = currentGroups.findIndex(g => g.group_id === over.id);
      
      const newArray = Array.from(currentGroups);
      const [movedItem] = newArray.splice(oldIndex, 1);
      newArray.splice(newIndex, 0, movedItem);
      return newArray;
    });
  };

  // Adiciona um grupo inteiro (baseado na categoria)
  const handleAddGroup = () => {
    if (!categoryToAdd) return; 
    
    const categoryId = categoryToAdd; 
    const category = allCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    const categoryProducts = allProducts.filter(p => p.category_id === categoryId);

    const newItems = categoryProducts.map(p => ({
      productId: p.id,
      name: p.name,
      additionalPrice: 0,
    }));

    const newGroup = {
      group_id: Date.now(), 
      name: category.name, 
      items: newItems,
    };
    
    setGroups([...groups, newGroup]);
    setCategoryToAdd(''); 
  };
  
  // Atualiza um grupo (quando um item é removido/preço muda)
  const handleUpdateGroup = (updatedGroup) => {
    setGroups(groups.map(g => g.group_id === updatedGroup.group_id ? updatedGroup : g));
  };
  
  // Remove um grupo inteiro
  const handleRemoveGroup = (groupId) => {
    setGroups(groups.filter(g => g.group_id !== groupId));
  };

  // Salva o formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- ESTA É A CORREÇÃO ---
    // Precisamos enviar o ID da promoção (se ele existir) de volta
    onSubmit({ 
      id: initialData.id, // <-- Faltava esta linha
      name, 
      basePrice, 
      groups 
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} onKeyDown={preventEnter}>
      {/* --- Campos de Nome e Preço --- */}
      <div className={styles.formGroup}>
        <label>Nome da Promoção</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Combo Casal"
          onKeyDown={preventEnter}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Valor Base (R$)</label>
        <input
          type="number"
          step="0.01"
          value={basePrice}
          onChange={(e) => setBasePrice(parseFloat(e.target.value))}
          onKeyDown={preventEnter}
          required
        />
      </div>

      <hr className={styles.divider} />
      <h3>Grupos de Produtos</h3>

      {/* --- Contexto do Drag-and-Drop --- */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]} 
      >
        <SortableContext
          items={groups.map(g => g.group_id)} 
          strategy={verticalListSortingStrategy}
        >
          {/* Container dos grupos arrastáveis */}
          <div className={styles.groupsContainer}>
            {groups.map((group) => (
              <GroupEditor
                key={group.group_id}
                group={group}
                onUpdate={handleUpdateGroup}
                onRemove={() => handleRemoveGroup(group.group_id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* --- Controles de Adicionar Grupo --- */}
      <div className={styles.addGroupControls}>
        <div className={styles.selectWrapper}>
          <StyledSelect
            value={categoryToAdd}
            onChange={(e) => setCategoryToAdd(e.target.value)}
          >
            <option value="">-- Selecionar grupo de produtos --</option>
            {allCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </StyledSelect>
        </div>
        <button
          type="button"
          className={styles.addGroupButton}
          onClick={handleAddGroup}
        >
          <IoAdd /> Adicionar
        </button>
      </div>

      <hr className={styles.divider} />
      
      {/* --- Botão Salvar --- */}
      <button type="submit" className={styles.saveButton}>
        Salvar Promoção
      </button>
    </form>
  );
}