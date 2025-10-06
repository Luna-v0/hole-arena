import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:8000';

type Bot = {
  name: string;
  algorithm: string;
};

export const GameConfigurator = () => {
  const [humanPlayers, setHumanPlayers] = useState(2);
  const [bots, setBots] = useState<Bot[]>([]);
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    try {
      const response = await fetch(`${BASE_URL}/games/create_configured`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          human_players: humanPlayers,
          bot_players: bots 
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create game');
      }
      const data = await response.json();
      navigate(`/game/${data.game_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const addBot = () => {
    const totalPlayers = humanPlayers + bots.length;
    if (totalPlayers < 4) {
      setBots([...bots, { name: `Bot ${bots.length + 1}`, algorithm: 'random' }]);
    }
  };

  const removeBot = (index: number) => {
    setBots(bots.filter((_, i) => i !== index));
  };

  const totalPlayers = humanPlayers + bots.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200 p-4">
      <div className="w-full max-w-2xl bg-slate-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-center">Configure Your Game</h1>
        
        <div className="mb-6">
          <label className="block text-xl font-bold mb-2">Players</label>
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-lg mb-2">Total Players: {totalPlayers} (must be 2 or 4)</p>
            
            <div className="mb-4">
              <label className="block text-lg mb-1">Human Players</label>
              <select 
                value={humanPlayers} 
                onChange={(e) => setHumanPlayers(Number(e.target.value))}
                className="w-full bg-slate-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>

            <div>
              <h3 className="text-lg mb-2">Bot Players</h3>
              {bots.map((bot, index) => (
                <div key={index} className="flex items-center mb-2 bg-slate-600 p-2 rounded-lg">
                  <input 
                    type="text" 
                    value={bot.name} 
                    onChange={(e) => {
                      const newBots = [...bots];
                      newBots[index].name = e.target.value;
                      setBots(newBots);
                    }}
                    className="flex-grow bg-slate-500 p-2 rounded-l-lg focus:outline-none"
                  />
                  <select 
                    value={bot.algorithm} 
                    onChange={(e) => {
                      const newBots = [...bots];
                      newBots[index].algorithm = e.target.value;
                      setBots(newBots);
                    }}
                    className="bg-slate-500 p-2 focus:outline-none"
                  >
                    <option value="random">Random</option>
                    {/* Add other algorithms here when available */}
                  </select>
                  <button onClick={() => removeBot(index)} className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r-lg">Remove</button>
                </div>
              ))}
              {totalPlayers < 4 && (
                <button onClick={addBot} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-2">Add Bot</button>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={handleCreateGame} 
          disabled={totalPlayers !== 2 && totalPlayers !== 4}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};
