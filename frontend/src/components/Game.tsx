
import { useParams } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Player } from './Player';
import { Deck } from './Deck';
import { Meld } from './Meld';
import { MeldArea } from './MeldArea';
import './Game.css';

export const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, error, joinGame, startGame, createMeld, addToMeld, drawFromDeck, discardCard } = useGame(gameId);

  const handleJoinGame = () => {
    const playerName = prompt('Enter your name:');
    if (playerName) {
      joinGame(playerName);
    }
  };

  const currentPlayerIndex = gameState?.current_turn_player_index ?? 0;
  const currentPlayer = gameState?.players[currentPlayerIndex];
  const otherPlayers = gameState?.players.filter((_, index) => index !== currentPlayerIndex) || [];

  return (
    <div className="game-board bg-slate-900 text-slate-200 min-h-screen p-4">
      <h1 className="text-4xl font-bold text-center mb-4">Buraco</h1>
      
      {gameId && !gameState?.game_started && (
        <div className="text-center">
          <button onClick={handleJoinGame} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Join Game</button>
        </div>
      )}
      
      {gameId &&
        gameState &&
        !gameState.game_started &&
        gameState.players.length >= 2 && (
          <div className="text-center mt-4">
            <button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Start Game</button>
          </div>
        )}

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {gameState && gameState.game_started && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="top-area bg-slate-800 p-4 rounded-lg mb-4">
              <Deck deck={gameState.deck} discardPile={gameState.discard_pile} drawFromDeck={drawFromDeck} discardCard={discardCard} />
            </div>
            <div className="melds-area bg-slate-800 p-4 rounded-lg">
              <h4 className="text-xl font-bold mb-2">Melds</h4>
              <div className="flex flex-wrap">
                {gameState.players.map((player) =>
                  player.melds.map((meld) => (
                    <Meld key={meld.id} meld={meld} onDrop={(card) => addToMeld(meld.id, card)} />
                  ))
                )}
                <MeldArea onDrop={(card) => createMeld([card])} />
              </div>
            </div>
          </div>

          <div className="player-area bg-slate-800 p-4 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Players</h3>
            {otherPlayers.map((player, index) => (
              <Player key={index} player={player} />
            ))}
          </div>

          {currentPlayer && (
            <div className="current-player-area lg:col-span-3 bg-slate-700 p-4 rounded-lg mt-4">
              <h3 className="text-2xl font-bold mb-2">Your Hand</h3>
              <Player player={currentPlayer} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
