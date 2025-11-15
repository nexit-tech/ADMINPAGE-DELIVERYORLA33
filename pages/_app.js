import '../styles/globals.css';
import 'react-datepicker/dist/react-datepicker.css'; // <-- 1. Adicione esta linha
import Navbar from '../components/Navbar';
import { registerLocale } from 'react-datepicker'; // <-- 2. Adicione esta linha
import { ptBR } from 'date-fns/locale/pt-BR'; // <-- 3. Adicione esta linha
registerLocale('pt-BR', ptBR); // <-- 4. Adicione esta linha

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;