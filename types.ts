export interface Point {
  x: number;
  y: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export interface GameTheme {
  name: string;
  backgroundColor: string;
  gridColor: string;
  snakeColor: string;
  snakeHeadEmoji: string; // Used for the head
  snakeBodyChar: string; // Used for body segments if we want text-based, or just color
  foodEmoji: string;
  borderColor: string;
  textColor: string;
  description: string;
}

export interface GameState {
  snake: Point[];
  food: Point;
  direction: Direction;
  score: number;
  highScore: number;
  status: GameStatus;
  speed: number;
}
