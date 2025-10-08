import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Player, Card } from '../types/index';

const BASE_URL = 'http://localhost:8000';

export const useGame = (gameId?: string, playerId?: string | null) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const fetchGameState = useCallback(async () => {
    if (!gameId) return;
    try {
      const response = await fetch(`${BASE_URL}/games/${gameId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game state');
      }
      const data: GameState = await response.json();
      setGameState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, [gameId]);

  const joinGame = useCallback(async (playerName: string) => {
    if (!gameId) return;
    try {
      const response = await fetch(`${BASE_URL}/games/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player_name: playerName }),
      });
      if (!response.ok) {
        throw new Error('Failed to join game');
      }
      const player: Player = await response.json();
      return player;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, [gameId]);

  // Track which games have had start requested (persist across renders)
  const startedGamesRef = useRef<Set<string>>(new Set());
  const startInProgressRef = useRef<Set<string>>(new Set());

  const startGame = useCallback(async () => {
    console.log(`[useGame] startGame called for gameId: ${gameId}`);

    if (!gameId) {
      console.log('[useGame] No gameId, returning');
      return;
    }

    // Check if already started
    if (startedGamesRef.current.has(gameId)) {
      console.warn(`[useGame] ⚠️ Game ${gameId} already started, ignoring duplicate call`);
      return;
    }

    // Check if start is in progress
    if (startInProgressRef.current.has(gameId)) {
      console.warn(`[useGame] ⚠️ Start in progress for ${gameId}, ignoring duplicate call`);
      return;
    }

    console.log(`[useGame] ✓ Starting game ${gameId}`);

    // Mark as in progress
    startInProgressRef.current.add(gameId);
    startedGamesRef.current.add(gameId);

    try {
      const response = await fetch(`${BASE_URL}/games/${gameId}/start`, {
        method: 'POST',
      });

      console.log(`[useGame] Start response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[useGame] ❌ Start failed: ${response.status} - ${errorText}`);
        // Remove from sets on error so it can be retried
        startedGamesRef.current.delete(gameId);
        startInProgressRef.current.delete(gameId);
        throw new Error(`Failed to start game: ${response.status}`);
      }

      console.log(`[useGame] ✓ Game started successfully`);
      startInProgressRef.current.delete(gameId);

    } catch (err) {
      console.error(`[useGame] ❌ Exception during start:`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      startInProgressRef.current.delete(gameId);
    }
  }, [gameId]);

  const createMeld = useCallback((cards: Card[]) => {
    if (ws.current && playerId) {
      ws.current.send(JSON.stringify({ action: 'meld_cards', cards, player_id: playerId }));
    }
  }, [playerId]);

  const addToMeld = useCallback((meldId: number, card: Card) => {
    if (ws.current && playerId) {
      ws.current.send(JSON.stringify({ action: 'meld_cards', cards: [card], target_meld_id: meldId, player_id: playerId }));
    }
  }, [playerId]);

  const drawFromDeck = useCallback(() => {
    if (ws.current && playerId) {
      ws.current.send(JSON.stringify({ action: 'draw_from_deck', player_id: playerId }));
    }
  }, [playerId]);

  const discardCard = useCallback((card: Card) => {
    if (ws.current && playerId) {
      ws.current.send(JSON.stringify({ action: 'discard_card', card, player_id: playerId }));
    }
  }, [playerId]);

  const takeDiscardPile = useCallback(() => {
    if (ws.current && playerId) {
      ws.current.send(JSON.stringify({ action: 'take_discard_pile', player_id: playerId }));
    }
  }, [playerId]);

  const playBotTurn = useCallback(() => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ action: 'PLAY_BOT_TURN' }));
    }
  }, []);

  useEffect(() => {
    if (!gameId) return;

    fetchGameState();

    ws.current = new WebSocket(`ws://localhost:8000/ws/${gameId}`);

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'game_state_update':
          setGameState(message.payload);
          break;
        case 'player_connected':
        case 'player_disconnected':
          // You could show a toast notification here
          console.log(message.payload);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    };

    ws.current.onerror = (err) => {
      setError('WebSocket error');
      console.error('WebSocket error:', err);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.current?.close();
    };
  }, [gameId, fetchGameState]);

  return { gameState, error, joinGame, startGame, createMeld, addToMeld, drawFromDeck, discardCard, takeDiscardPile, playBotTurn };
};
