import React, { useEffect } from 'react';
import { RPGProvider, useRPG } from './context/RPGContext';
import { HubScreen } from './screens/HubScreen';
import { AtributosScreen } from './screens/AtributosScreen';
import { OrigensScreen } from './screens/OrigensScreen';
import { ClasseScreen } from './screens/ClasseScreen';
import { IdentidadeScreen } from './screens/IdentidadeScreen';
import { FichaScreen } from './screens/Ficha';

function Rotas() {
  const { telaAtual } = useRPG();

  switch (telaAtual) {
    case 'hub':
      return <HubScreen />;
    case 'atributos':
      return <AtributosScreen />;
    case 'origens':
      return <OrigensScreen />;
    case 'classe':
      return <ClasseScreen />;
    case 'identidade':
      return <IdentidadeScreen />;
    case 'ficha':
      return <FichaScreen />;
    default:
      return <HubScreen />;
  }
}

function App() {
  return (
    <RPGProvider>
      <AppContent />
    </RPGProvider>
  );
}

function AppContent() {
  const { telaAtual } = useRPG();

  const isFicha = telaAtual === 'ficha';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [telaAtual]);

  return (
    <div className={`min-h-screen w-full bg-zinc-950 overflow-x-hidden ${isFicha ? '' : 'p-4 md:p-6'}`}>
      <Rotas />
    </div>
  );
}

export default App;
