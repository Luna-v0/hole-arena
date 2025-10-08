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

  const startGame = useCallback(async () => {
    if (!gameId) return;
    try {
      const response = await fetch(`${BASE_URL}/games/${gameId}/start`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to start game');
      }
      // The full game state will be updated via WebSocket
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, [gameId]);

  const createMeld = useCallback((cards: Card[]) => {
    if (ws.current && playerId) {
      ws.current.send(JSON.stringify({ action: 'CREATE_MELD', cards, player_id: playerId }));
    }
  }, [playerId]);

  const addToMeld = useCallback((meldId: number, card: Card) => {
    if (ws.current && playerId) {
      ws.current.send(JSON.stringify({ action: 'ADD_TO_MELD', meld_id: meldId, card, player_id: playerId }));
    }
  }, [playerId]);

  const drawFromDeck = useCallback(() => {
    if (ws.current && playerId) {
      ws.current.send(JSON.stringify({ action: 'DRAW_FROM_DECK', player_id: playerId }));
    }
  }, [playerId]);

  const discardCard = useCallback((card: Card) => {
    if (ws.current && playerId) {
      ws.current.send(JSON.stringify({ action: 'DISCARD_CARD', card, player_id: playerId }));
    }
  }, [playerId]);

  const takeDiscardPile = useCallback(() => {
    if (ws.current && playerId) {
      ws.current.send(JSON.stringify({ action: 'TAKE_DISCARD_PILE', player_id: playerId }));
    }
  }, [playerId]);

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

  return { gameState, error, joinGame, startGame, createMeld, addToMeld, drawFromDeck, discardCard, takeDiscardPile };
};
