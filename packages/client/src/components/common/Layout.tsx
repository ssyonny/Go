import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useHeartbeat } from '../../hooks/useHeartbeat';

export default function Layout() {
  useHeartbeat();

  return (
    <>
      <Header />
      <main style={{ flex: 1, padding: 'var(--spacing-lg)', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>
    </>
  );
}
