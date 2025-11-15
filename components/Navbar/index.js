import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Navbar.module.css';
// Adicione o IoAnalyticsOutline
import { IoReceiptOutline, IoBookOutline, IoSettingsOutline, IoAnalyticsOutline } from 'react-icons/io5';

export default function Navbar() {
  const router = useRouter();

  const getLinkClass = (path) => {
    return router.pathname.startsWith(path) // Mudei para startsWith para highligh correto
      ? `${styles.menuLink} ${styles.active}`
      : styles.menuLink;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/pedidos">Delivery Orla33</Link>
      </div>
      <ul className={styles.menu}>
        <li>
          <Link href="/pedidos" className={getLinkClass('/pedidos')}>
            <IoReceiptOutline className={styles.icon} />
            <span>Pedidos</span>
          </Link>
        </li>
        <li>
          <Link href="/cardapio" className={getLinkClass('/cardapio')}>
            <IoBookOutline className={styles.icon} />
            <span>Cardápio</span>
          </Link>
        </li>
        {/* --- ADICIONE ESTE NOVO <li> --- */}
        <li>
          <Link href="/financeiro" className={getLinkClass('/financeiro')}>
            <IoAnalyticsOutline className={styles.icon} />
            <span>Financeiro</span>
          </Link>
        </li>
        <li>
          <Link href="/config" className={getLinkClass('/config')}>
            <IoSettingsOutline className={styles.icon} />
            <span>Configurações</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}