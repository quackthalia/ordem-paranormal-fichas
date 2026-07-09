import { RPGProvider, useRPG } from './context/RPGContext';
import { AtributosScreen } from './screens/AtributosScreen';
import { OrigensScreen } from './screens/OrigensScreen';
import { ClasseScreen } from './screens/ClasseScreen';
import { FichaScreen } from './screens/Ficha';

function Rotas() {
  const { telaAtual } = useRPG();

  switch (telaAtual) {
    case 'origens':
      return <OrigensScreen />;
    case 'classe':
      return <ClasseScreen />;
    case 'ficha':
      return <FichaScreen />;
    case 'atributos':
    default:
      return <AtributosScreen />;
  }
}

function App() {
  return (
    <RPGProvider>
      <div className="min-h-screen px-6 py-8 md:px-10">
        <Rotas />
      </div>
    </RPGProvider>
  );
}

export default App;
