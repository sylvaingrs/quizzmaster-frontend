import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../../../services/game-state.service';
import { ApiService } from '../../../services/api.service';
import { TimerComponent } from '../../../components/timer/timer.component';
import { LeaderboardComponent } from '../../../components/leaderboard/leaderboard.component';
import { RoomCodeDisplayComponent } from '../../../components/room-code-display/room-code-display.component';
import { AnswerCardComponent } from '../../../components/answer-card/answer-card.component';

@Component({
  selector: 'app-gamemaster-view',
  imports: [TimerComponent, LeaderboardComponent, RoomCodeDisplayComponent, AnswerCardComponent],
  template: `
    <div class="gm-container">
      <!-- Header Bar -->
      <div class="gm-header">
        <app-room-code [code]="gameState.roomId()" />
        @if (gameState.currentQuestion(); as q) {
          <app-timer [duration]="q.timeLimit" [questionId]="q.id" [paused]="gameState.isBuzzerTaken() || gameState.answerResult() !== null" />
        }
      </div>

      <div class="gm-body">
        <!-- Main Content -->
        <div class="gm-main">
          @if (gameState.currentQuestion(); as q) {
            <div class="question-card glass animate-scale-in">
              <h2 class="question-title">{{ q.title }}</h2>
              <div class="options-grid">
                @for (opt of q.options; track opt; let i = $index) {
                  <app-answer-card
                    [text]="opt"
                    [colorIndex]="i"
                    [disabled]="true"
                    [isCorrect]="gameState.correctAnswers().includes(opt)"
                    [showResult]="gameState.correctAnswers().length > 0"
                  />
                }
              </div>
            </div>

            <!-- Buzzer Status -->
            <div class="buzzer-status glass">
              @if (gameState.answerResult() !== null) {
                <div class="buzzed-info animate-scale-in" [style.color]="gameState.answerResult() ? 'var(--accent-green)' : 'var(--accent-red)'">
                  <span class="buzzed-name">{{ gameState.lastAnswerUserName() }} a eu {{ gameState.answerResult() ? 'bon ! ✅' : 'faux ❌' }}</span>
                </div>
              } @else if (gameState.buzzerHolderName(); as holder) {
                <div class="buzzed-info animate-scale-in">
                  <span class="buzzed-icon">🔔</span>
                  <span class="buzzed-name">{{ holder }} a buzzé !</span>
                </div>
              } @else {
                <div class="waiting-buzz">
                  <span>En attente d'un buzz...</span>
                  <div class="pulse-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </div>
                </div>
              }
            </div>

            <!-- Controls -->
            <div class="gm-controls">
              <button class="btn-control btn-next" (click)="nextQuestion()" [disabled]="loading()" id="btn-next-question">
                {{ loading() ? '...' : 'Question Suivante →' }}
              </button>
              <button class="btn-control btn-end" (click)="endGame()" [disabled]="loading()" id="btn-end-game">
                Terminer la partie
              </button>
            </div>
          } @else {
            <div class="no-question glass">
              <p>En attente de la première question...</p>
            </div>
          }
        </div>

        <!-- Sidebar: Leaderboard -->
        <div class="gm-sidebar">
          <app-leaderboard [entries]="gameState.leaderboard()" />

          <div class="players-panel glass">
            <h3>👥 Joueurs ({{ gameState.players().length }})</h3>
            <div class="players-list">
              @for (p of gameState.players(); track p.id) {
                <div class="player-row">
                  <span class="p-icon">
                    @if (p.role === 'GAMEMASTER') { 👑 }
                    @else if (p.role === 'PLAYER') { 🎮 }
                    @else { 👁️ }
                  </span>
                  <span class="p-name">{{ p.name }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      @if (error()) {
        <p class="error-msg">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    .gm-container {
      min-height: 100vh;
      padding: 1.5rem;
      position: relative;
      z-index: 1;
    }
    .gm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .gm-body {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 1.5rem;
      align-items: start;
    }
    .gm-main {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .question-card {
      padding: 2rem;
      border-radius: var(--radius-xl);
    }
    .question-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .option-display {
      padding: 1rem 1.25rem;
      border-radius: var(--radius-lg);
      color: white;
      font-weight: 600;
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .color-0 { background: var(--answer-red); }
    .color-1 { background: var(--answer-blue); }
    .color-2 { background: var(--answer-green); }
    .color-3 { background: var(--answer-yellow); }
    .shape { font-size: 1.25rem; }
    .buzzer-status {
      padding: 1.25rem;
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .buzzed-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent-yellow);
    }
    .buzzed-icon { font-size: 1.75rem; }
    .waiting-buzz {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: var(--text-muted);
    }
    .pulse-dots {
      display: flex;
      gap: 0.3rem;
    }
    .dot {
      width: 8px;
      height: 8px;
      background: var(--accent-violet);
      border-radius: 50%;
      animation: float 1.2s ease-in-out infinite;
    }
    .dot:nth-child(2) { animation-delay: 0.15s; }
    .dot:nth-child(3) { animation-delay: 0.3s; }
    .gm-controls {
      display: flex;
      gap: 0.75rem;
    }
    .btn-control {
      flex: 1;
      padding: 0.9rem;
      border: none;
      border-radius: var(--radius-full);
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all var(--transition-base);
    }
    .btn-next {
      background: var(--gradient-primary);
      color: white;
    }
    .btn-next:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow-violet);
    }
    .btn-end {
      background: var(--bg-card);
      color: var(--accent-red);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .btn-end:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.1);
    }
    .btn-control:disabled { opacity: 0.5; cursor: not-allowed; }
    .gm-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .players-panel {
      padding: 1rem;
      border-radius: var(--radius-lg);
    }
    .players-panel h3 {
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .players-list {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .player-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .p-icon { font-size: 1rem; }
    .p-name { font-weight: 500; font-size: 0.85rem; color: var(--text-primary); }
    .no-question {
      padding: 3rem;
      text-align: center;
      border-radius: var(--radius-xl);
      color: var(--text-muted);
    }
    .error-msg {
      color: var(--accent-red);
      text-align: center;
      margin-top: 1rem;
    }
    @media (max-width: 900px) {
      .gm-body { grid-template-columns: 1fr; }
    }
  `]
})
export class GamemasterViewComponent {
  loading = signal(false);
  error = signal('');
  shapes = ['▲', '◆', '●', '■'];

  constructor(
    public gameState: GameStateService,
    private api: ApiService,
    private router: Router
  ) {}

  nextQuestion(): void {
    this.loading.set(true);
    this.api.nextQuestion(this.gameState.roomId()).subscribe({
      next: (step) => {
        if (step.finished) {
          this.router.navigate(['/room', this.gameState.roomId(), 'results']);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur');
        this.loading.set(false);
      },
    });
  }

  endGame(): void {
    this.loading.set(true);
    this.api.endGame(this.gameState.roomId()).subscribe({
      next: () => {
        this.router.navigate(['/room', this.gameState.roomId(), 'results']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur');
        this.loading.set(false);
      },
    });
  }
}
