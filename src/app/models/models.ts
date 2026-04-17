// --- Quiz & Question models ---

export interface Quiz {
  id: number;
  title: string;
}

export interface Question {
  id: number;
  quizId: number;
  title: string;
  options: string[];
  correctAnswer: string[];
  timeLimit: number;
}

export interface CreateQuestionDto {
  title: string;
  options: string[];
  correctAnswer: string[];
  timeLimit: number;
}

// --- Room models ---

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
}

export type PlayerRole = 'PLAYER' | 'GAMEMASTER' | 'SPECTATOR';
export type RoomStatus = 'WAITING' | 'PLAYING' | 'FINISHED';

export interface Room {
  id: string;
  quizId: number;
  status: RoomStatus;
  players: Player[];
}

export interface GameStep {
  room: string;
  finished: boolean;
  currentQuestion?: QuestionDto;
}

export interface QuestionDto {
  id: number;
  title: string;
  options: string[];
  timeLimit: number;
}

// --- Buzzer models ---

export interface BuzzResponse {
  success: boolean;
  userId: string;
}

export interface AnswerResponse {
  correct: boolean;
  userId: string;
}

// --- Leaderboard models ---

export interface LeaderboardEntry {
  userId: string;
  score: number;
}

export interface LeaderboardResponse {
  roomId: string;
  leaderboard: LeaderboardEntry[];
}

// --- WebSocket event types ---

export type WsEvent =
  | { event: 'game.started'; currentQuestion: QuestionDto }
  | { event: 'question.changed'; currentQuestion: QuestionDto }
  | { event: 'buzzer.taken'; userId: string }
  | { event: 'buzzer.reset' }
  | { event: 'answer.result'; userId: string; correct: boolean; expected?: string[] }
  | { event: 'scores.updated'; leaderboard: LeaderboardEntry[] }
  | { event: 'game.ended'; leaderboard: LeaderboardEntry[] };
