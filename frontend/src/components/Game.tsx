import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useGame } from "../hooks/useGame";
import { Player } from "./Player";
import { Deck } from "./Deck";
import { Meld } from "./Meld";
import { MeldArea } from "./MeldArea";
import "./Game.css";

export const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const {
    gameState,
    error,
    joinGame,
    startGame,
    createMeld,
    addToMeld,
    drawFromDeck,
    discardCard,
    takeDiscardPile,
  } = useGame(gameId, playerId);
  // Auto-start logic: More robust approach
  const hasAttemptedAutoStartRef = useRef(false);

  useEffect(() => {
    console.log(`[Game] useEffect triggered`, {
      hasGameState: !!gameState,
      gameStarted: gameState?.game_started,
      playerCount: gameState?.players.length,
      hasAttempted: hasAttemptedAutoStartRef.current,
    });

    // Early exits
    if (!gameState) {
      console.log('[Game] No gameState, returning');
      return;
    }

    if (hasAttemptedAutoStartRef.current) {
      console.log('[Game] Already attempted auto-start, returning');
      return;
    }

    if (gameState.game_started) {
      console.log('[Game] Game already started, marking as attempted');
      hasAttemptedAutoStartRef.current = true;
      return;
    }

    // Check if ready for auto-start
    const hasEnoughPlayers = gameState.players.length >= 2;
    const allAreBots = gameState.players.length > 0 && gameState.players.every((p) => p.is_bot);

    console.log('[Game] Auto-start check:', {
      hasEnoughPlayers,
      allAreBots,
      playerCount: gameState.players.length,
    });

    if (hasEnoughPlayers && allAreBots) {
      console.log('[Game] ✓ Conditions met, attempting auto-start');
      hasAttemptedAutoStartRef.current = true;
      startGame();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.game_started, gameState?.players.length]); // Only react to these specific changes

  const handleJoinGame = async () => {
    const playerName = prompt("Enter your name:");
    if (playerName) {
      const player = await joinGame(playerName);
      if (player) {
        setPlayerId(player.player_id);
      }
    }
  };

  const currentPlayerIndex = gameState?.current_turn_player_index ?? 0;
  const currentPlayer = gameState?.players[currentPlayerIndex];
  const otherPlayers =
    gameState?.players.filter((_, index) => index !== currentPlayerIndex) || [];

  return (
    <div className="game-board bg-slate-900 text-slate-200 min-h-screen p-4">
      <h1 className="text-4xl font-bold text-center mb-4">Buraco</h1>

      {gameId && !gameState?.game_started && (
        <div className="text-center">
          <button
            onClick={handleJoinGame}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Join Game
          </button>
        </div>
      )}

      {gameId &&
        gameState &&
        !gameState.game_started &&
        gameState.players.length >= 2 && (
          <div className="text-center mt-4">
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Start Game
            </button>
          </div>
        )}

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {gameState && gameState.game_started && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="top-area bg-slate-800 p-4 rounded-lg mb-4">
              <Deck
                deck={gameState.deck}
                discardPile={gameState.discard_pile}
                drawFromDeck={drawFromDeck}
                discardCard={discardCard}
                takeDiscardPile={takeDiscardPile}
              />
            </div>
            <div className="melds-area bg-slate-800 p-4 rounded-lg">
              <h4 className="text-xl font-bold mb-2">Melds</h4>
              <div className="flex flex-wrap">
                {gameState.players.flatMap((player) =>
                  player.melds.map((meld) => (
                    <Meld
                      key={`${player.player_id}-${meld.meld_id}`}
                      meld={meld}
                      onDrop={(card) => addToMeld(meld.meld_id, card)}
                    />
                  ))
                )}
                <MeldArea onDrop={(card) => createMeld([card])} />
              </div>
            </div>
          </div>

          <div className="player-area bg-slate-800 p-4 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Players</h3>
            {otherPlayers.map((player) => (
              <Player key={player.player_id} player={player} />
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
