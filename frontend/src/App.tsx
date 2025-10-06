import { Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Game } from './components/Game';
import { Home } from './components/Home';
import { GameConfigurator } from './components/GameConfigurator';
import './App.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<GameConfigurator />} />
        <Route path="/game/:gameId" element={<Game />} />
      </Routes>
    </DndProvider>
  );
}

export default App;
