import Head from 'next/head';
import { useState } from 'react';
import styles from './config.module.css';
import ToggleSwitch from '../../components/ToggleSwitch';
import { IoStorefrontOutline, IoTimeOutline, IoPower } from 'react-icons/io5';

export default function ConfigPage() {
  // Estados para simular os dados (virão do Supabase)
  const [storeName, setStoreName] = useState('Delivery Orla33');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [openTime, setOpenTime] = useState('18:00');
  const [closeTime, setCloseTime] = useState('23:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui viria a lógica para salvar no Supabase
    console.log('Salvando configurações:', {
      storeName,
      isStoreOpen,
      openTime,
      closeTime
    });
    alert('Configurações salvas (simulado)!');
  };

  return (
    <>
      <Head>
        <title>Configurações - Delivery Orla33</title>
      </Head>
      <main className={styles.container}>
        <h1>Configurações da Loja</h1>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* Card 1: Status da Loja */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <IoPower /> Status da Loja
            </h2>
            <ToggleSwitch 
              label={isStoreOpen ? 'Loja Aberta' : 'Loja Fechada'}
              checked={isStoreOpen}
              onChange={setIsStoreOpen}
            />
            <p className={styles.cardHelp}>
              Quando a loja está fechada, clientes não podem fazer novos pedidos.
            </p>
          </div>

          {/* Card 2: Informações */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <IoStorefrontOutline /> Informações
            </h2>
            <div className={styles.formGroup}>
              <label htmlFor="storeName">Nome do Estabelecimento</label>
              <input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
          </div>

          {/* Card 3: Horários */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <IoTimeOutline /> Horário de Funcionamento
            </h2>
            <div className={styles.timeGroup}>
              <div className={styles.formGroup}>
                <label htmlFor="openTime">Abre às</label>
                <input
                  id="openTime"
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="closeTime">Fecha às</label>
                <input
                  id="closeTime"
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className={styles.actions}>
            <button type="submit" className={styles.saveButton}>
              Salvar Alterações
            </button>
          </div>

        </form>
      </main>
    </>
  );
}