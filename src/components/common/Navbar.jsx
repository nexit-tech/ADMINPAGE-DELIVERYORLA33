import styles from './Navbar.module.css';
import logo from '../../assets/images/Orla33 sem fundo.png';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link to="/">
          <img src={logo} alt="Orla33 Logo" className={styles.logo} />
        </Link>
        <span className={styles.brandName}>Painel Orla33</span>
      </div>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/pedidos" className={styles.navLink}>Pedidos</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/produtos" className={styles.navLink}>Produtos</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/promocoes" className={styles.navLink}>Promoções</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/financas" className={styles.navLink}>Finanças</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/configuracoes" className={styles.navLink}>Configurações</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;