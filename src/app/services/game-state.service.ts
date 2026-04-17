import { Injectable, signal, computed } from '@angular/core';
import { WebSocketService } from './websocket.service';
import {
  PlayerRole,
  RoomStatus,
  QuestionDto,
  LeaderboardEntry,
  Player,
} from '../models/models';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  // --- Identity ---
  readonly roomId = signal<string>('');
  readonly playerId = signal<string>('');
  readonly playerName = signal<string>('');
  readonly playerRole = signal<PlayerRole>('PLAYER');

  // --- Room state ---
  readonly roomStatus = signal<RoomStatus>('WAITING');
  readonly players = signal<Player[]>([]);

  // --- Game state ---
  readonly currentQuestion = signal<QuestionDto | null>(null);
  readonly buzzerHolder = signal<string | null>(null);
  readonly leaderboard = signal<LeaderboardEntry[]>([]);
  alreadyAnsweredWrong = signal<boolean>(false);
  correctAnswers = signal<string[]>([]);
  readonly answerResult = signal<boolean | null>(null);
  readonly gameFinished = signal(false);
  readonly finalLeaderboard = signal<LeaderboardEntry[]>([]);

  // --- Computed ---
  readonly isGameMaster = computed(() => this.playerRole() === 'GAMEMASTER');
  readonly isPlayer = computed(() => this.playerRole() === 'PLAYER');
  readonly isSpectator = computed(() => this.playerRole() === 'SPECTATOR');
  readonly isBuzzerTaken = computed(() => this.buzzerHolder() !== null);
  readonly isMyBuzz = computed(() => this.buzzerHolder() === this.playerId());
  
  readonly buzzerHolderName = computed(() => {
    const holderId = this.buzzerHolder();
    if (!holderId) return null;
    const p = this.players().find(player => player.id === holderId);
    return p ? p.name : holderId;
  });

  readonly lastAnswerUserId = signal<string | null>(null);

  readonly lastAnswerUserName = computed(() => {
    const holderId = this.lastAnswerUserId();
    if (!holderId) return null;
    const p = this.players().find(player => player.id === holderId);
    return p ? p.name : holderId;
  });

  readonly canBuzz = computed(
    () =>
      this.isPlayer() &&
      !this.isBuzzerTaken() &&
      this.roomStatus() === 'PLAYING' &&
      !this.alreadyAnsweredWrong()
  );

  private subscriptions: Subscription[] = [];

  constructor(private ws: WebSocketService) {}

  /** Initialize the state from join/create response and connect WS */
  init(
    roomId: string,
    playerId: string,
    playerName: string,
    playerRole: PlayerRole,
    players: Player[]
  ): void {
    this.roomId.set(roomId);
    this.playerId.set(playerId);
    this.playerName.set(playerName);
    this.playerRole.set(playerRole);
    this.players.set(players);
    this.roomStatus.set('WAITING');
    this.currentQuestion.set(null);
    this.buzzerHolder.set(null);
    this.leaderboard.set([]);
    this.answerResult.set(null);
    this.alreadyAnsweredWrong.set(false);
    this.correctAnswers.set([]);
    this.gameFinished.set(false);
    this.finalLeaderboard.set([]);

    // Persist to sessionStorage
    sessionStorage.setItem('qm_roomId', roomId);
    sessionStorage.setItem('qm_playerId', playerId);
    sessionStorage.setItem('qm_playerName', playerName);
    sessionStorage.setItem('qm_playerRole', playerRole);

    this.connectWebSocket(roomId);
  }

  /** Try to restore state from sessionStorage */
  restore(): boolean {
    const roomId = sessionStorage.getItem('qm_roomId');
    const playerId = sessionStorage.getItem('qm_playerId');
    const playerName = sessionStorage.getItem('qm_playerName');
    const playerRole = sessionStorage.getItem('qm_playerRole') as PlayerRole;

    if (roomId && playerId && playerName && playerRole) {
      this.roomId.set(roomId);
      this.playerId.set(playerId);
      this.playerName.set(playerName);
      this.playerRole.set(playerRole);
      this.connectWebSocket(roomId);
      return true;
    }
    return false;
  }

  private connectWebSocket(roomId: string): void {
    // Clean up previous subscriptions
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];

    this.ws.connect(roomId);

    this.subscriptions.push(
      this.ws.on('game.started').subscribe((msg) => {
        this.roomStatus.set('PLAYING');
        this.currentQuestion.set(msg.currentQuestion);
        this.buzzerHolder.set(null);
        this.answerResult.set(null);
        this.alreadyAnsweredWrong.set(false);
        this.correctAnswers.set([]);
      })
    );

    this.subscriptions.push(
      this.ws.on('question.changed').subscribe((msg) => {
        this.currentQuestion.set(msg.currentQuestion);
        this.buzzerHolder.set(null);
        this.answerResult.set(null);
        this.alreadyAnsweredWrong.set(false);
        this.correctAnswers.set([]);
      })
    );

    this.subscriptions.push(
      this.ws.on('buzzer.taken').subscribe((msg) => {
        this.buzzerHolder.set(msg.userId);
        this.answerResult.set(null); // Clear previous incorrect result msg if anyone buzzes
      })
    );

    this.subscriptions.push(
      this.ws.on('buzzer.reset').subscribe(() => {
        this.buzzerHolder.set(null);
        // Do NOT reset answerResult, so players can see 'Mauvaise reposne' temporarily
      })
    );

    this.subscriptions.push(
      this.ws.on('answer.result').subscribe((msg) => {
        this.answerResult.set(msg.correct);
        this.lastAnswerUserId.set(msg.userId);
        if (msg.correct && msg.expected) {
          this.correctAnswers.set(msg.expected);
        }
        if (!msg.correct) {
          if (msg.userId === this.playerId()) {
            this.alreadyAnsweredWrong.set(true);
          }
          // Show "Incorrect" for 2.5 seconds, then clear it so people can buzz again
          setTimeout(() => {
            if (this.answerResult() === false) {
              this.answerResult.set(null);
            }
          }, 2500);
        }
      })
    );

    this.subscriptions.push(
      this.ws.on('scores.updated').subscribe((msg) => {
        this.leaderboard.set(msg.leaderboard);
      })
    );

    this.subscriptions.push(
      this.ws.on('game.ended').subscribe((msg) => {
        this.roomStatus.set('FINISHED');
        this.gameFinished.set(true);
        this.finalLeaderboard.set(msg.leaderboard);
      })
    );
  }

  setAnswerResult(correct: boolean): void {
    this.answerResult.set(correct);
  }

  updatePlayers(players: Player[]): void {
    this.players.set(players);
  }

  cleanup(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
    this.ws.disconnect();
    sessionStorage.removeItem('qm_roomId');
    sessionStorage.removeItem('qm_playerId');
    sessionStorage.removeItem('qm_playerName');
    sessionStorage.removeItem('qm_playerRole');
  }
}
