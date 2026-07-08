import { RPGProvider, useRPG } from './context/RPGContext';
import { AtributosScreen } from './screens/AtributosScreen';
import { OrigensScreen } from './screens/OrigensScreen';
import { ClasseScreen } from './screens/ClasseScreen';
import { FichaScreen } from './screens/Ficha';

function Rotas() {
  const { telaAtual } = useRPG();

  switch (telaAtual) {
    case 'atributos':
      return <AtributosScreen />;
    case 'origens':
      return <OrigensScreen />;
    case 'classe':
      return <ClasseScreen />;
    case 'ficha':
      return <FichaScreen />;
    default:
      return <AtributosScreen />;
  }
}

function App() {
  return (
    <RPGProvider>
      {/* Estilos globais */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body, #root {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background-color: #121212;
              color: #fff;
              font-family: sans-serif;
              overflow-x: hidden;
            }
            * { box-sizing: border-box; }
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }
            select option { background-color: #1a1a1a; color: #fff; }
          `,
        }}
      />

      <div
        style={{
          padding: '30px 40px',
          fontFamily: 'sans-serif',
          backgroundColor: '#121212',
          color: '#fff',
          minHeight: '100vh',
          width: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <Rotas />
      </div>
    </RPGProvider>
  );
}

export default App;