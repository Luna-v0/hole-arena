import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const [gameId, setGameId] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const navigate = useNavigate();

  const handleJoinGame = () => {
    if (gameId) {
      navigate(`/game/${gameId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200">
      <div className="text-center p-4">
        <h1 className="text-6xl font-bold mb-2">Buraco</h1>
        <p className="text-xl text-slate-400 mb-12">The classic card game, online.</p>

        <div className="space-y-4 max-w-sm mx-auto">
          <button 
            onClick={() => navigate('/create')} 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg text-2xl transition duration-300 transform hover:scale-105"
          >
            Create a New Game
          </button>

          {!showJoinInput && (
            <button 
              onClick={() => setShowJoinInput(true)} 
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-8 rounded-lg text-2xl transition duration-300"
            >
              Join Game
            </button>
          )}

          {showJoinInput && (
            <div className="flex items-center pt-4">
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Enter Game ID..."
                className="flex-grow bg-slate-800 text-slate-200 placeholder-slate-500 p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button 
                onClick={handleJoinGame} 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-r-lg transition duration-300"
              >
                Go
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
