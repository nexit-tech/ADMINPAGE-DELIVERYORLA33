import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/pedidos');
  }, [router]);

  return null; // Renderiza nada, pois será redirecionado
}