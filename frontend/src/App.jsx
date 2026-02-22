import { useState } from 'react';
import CinematicEntry from './components/CinematicEntry';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [booted, setBooted] = useState(false);

  return (
    <>
      {!booted && <CinematicEntry onComplete={() => setBooted(true)} />}
      {booted && <DashboardPage />}
    </>
  );
}
