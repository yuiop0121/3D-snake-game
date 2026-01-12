import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameStatus, Direction, Point } from '../types';
import { INITIAL_GAME_STATE, GRID_SIZE, INITIAL_SPEED, SPEED_INCREMENT, MIN_SPEED } from '../constants';

const getRandomPosition = (snake: Point[]): Point => {
  let newPos: Point;
  while (true) {
    newPos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    const collision = snake.some((segment) => segment.x === newPos.x && segment.y === newPos.y);
    if (!collision) break;
  }
  return newPos;
};

export const useSnakeGame = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  
  // Use refs for values needed inside the effect loop to avoid stale closures
  // without triggering re-renders themselves or complicating the dependency array endlessly.
  const directionRef = useRef<Direction>(INITIAL_GAME_STATE.direction);
  const nextDirectionRef = useRef<Direction>(INITIAL_GAME_STATE.direction); // Buffer for quick key presses
  const statusRef = useRef<GameStatus>(INITIAL_GAME_STATE.status);

  // Sync ref with state when state changes (for external controls)
  useEffect(() => {
    statusRef.current = gameState.status;
  }, [gameState.status]);

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...INITIAL_GAME_STATE,
      highScore: prev.highScore,
      status: GameStatus.PLAYING,
      food: getRandomPosition(INITIAL_GAME_STATE.snake),
    }));
    directionRef.current = Direction.UP;
    nextDirectionRef.current = Direction.UP;
  }, []);

  const pauseGame = useCallback(() => {
    setGameState((prev) => {
      if (prev.status === GameStatus.PLAYING) return { ...prev, status: GameStatus.PAUSED };
      if (prev.status === GameStatus.PAUSED) return { ...prev, status: GameStatus.PLAYING };
      return prev;
    });
  }, []);

  const changeDirection = useCallback((newDir: Direction) => {
    const currentDir = directionRef.current;
    
    // Prevent 180 degree turns
    const isOpposite =
      (newDir === Direction.UP && currentDir === Direction.DOWN) ||
      (newDir === Direction.DOWN && currentDir === Direction.UP) ||
      (newDir === Direction.LEFT && currentDir === Direction.RIGHT) ||
      (newDir === Direction.RIGHT && currentDir === Direction.LEFT);

    if (!isOpposite) {
      nextDirectionRef.current = newDir;
    }
  }, []);

  // Game Loop
  useEffect(() => {
    const moveSnake = () => {
      if (statusRef.current !== GameStatus.PLAYING) return;

      setGameState((prev) => {
        // Update direction from buffer
        directionRef.current = nextDirectionRef.current;
        const head = prev.snake[0];
        const newHead = { ...head };

        switch (directionRef.current) {
          case Direction.UP: newHead.y -= 1; break;
          case Direction.DOWN: newHead.y += 1; break;
          case Direction.LEFT: newHead.x -= 1; break;
          case Direction.RIGHT: newHead.x += 1; break;
        }

        // Check Wall Collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          return { ...prev, status: GameStatus.GAME_OVER };
        }

        // Check Self Collision
        if (prev.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
           return { ...prev, status: GameStatus.GAME_OVER };
        }

        const newSnake = [newHead, ...prev.snake];
        let newFood = prev.food;
        let newScore = prev.score;
        let newSpeed = prev.speed;

        // Check Food Collision
        if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
          newScore += 10;
          // Increase speed slightly
          newSpeed = Math.max(MIN_SPEED, prev.speed - SPEED_INCREMENT);
          newFood = getRandomPosition(newSnake);
        } else {
          // Remove tail if didn't eat
          newSnake.pop();
        }

        const newHighScore = newScore > prev.highScore ? newScore : prev.highScore;

        return {
          ...prev,
          snake: newSnake,
          food: newFood,
          score: newScore,
          highScore: newHighScore,
          speed: newSpeed,
          direction: directionRef.current
        };
      });
    };

    const gameInterval = setInterval(moveSnake, gameState.speed);
    return () => clearInterval(gameInterval);
  }, [gameState.speed, gameState.status]); // Re-create interval if speed or status changes

  return {
    gameState,
    startGame,
    pauseGame,
    changeDirection,
  };
};
