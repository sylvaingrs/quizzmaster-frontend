import { Component } from '@angular/core';
import { GameStateService } from '../../../services/game-state.service';
import { TimerComponent } from '../../../components/timer/timer.component';
import { LeaderboardComponent } from '../../../components/leaderboard/leaderboard.component';
import { AnswerCardComponent } from '../../../components/answer-card/answer-card.component';

@Component({
  selector: 'app-spectator-view',
  imports: [TimerComponent, LeaderboardComponent, AnswerCardComponent],
  template: `
    <div class="spectator-container">
      @if (gameState.currentQuestion(); as q) {
        <!-- Header -->
        <div class="spec-header">
          <div class="spec-badge glass">
            <span>👁️</span>
            <span>Mode Spectateur</span>
          </div>
          <app-timer [duration]="q.timeLimit" [questionId]="q.id" [paused]="gameState.isBuzzerTaken() || gameState.answerResult() !== null" />
        </div>

        <div class="spec-body">
          <!-- Main -->
          <div class="spec-main">
            <!-- Question -->
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
            <div class="buzz-status glass">
              @if (gameState.answerResult() !== null) {
                <div class="buzzed animate-scale-in" [style.color]="gameState.answerResult() ? 'var(--accent-green)' : 'var(--accent-red)'">
                  <span class="buzz-text">{{ gameState.lastAnswerUserName() }} a eu {{ gameState.answerResult() ? 'bon ! ✅' : 'faux ❌' }}</span>
                </div>
              } @else if (gameState.buzzerHolderName(); as holder) {
                <div class="buzzed animate-scale-in">
                  <span class="buzz-emit">🔔</span>
                  <span class="buzz-text">{{ holder }} a buzzé !</span>
                </div>
              } @else {
                <div class="no-buzz">
                  <span>En attente d'un buzz...</span>
                </div>
              }
            </div>
          </div>

          <!-- Sidebar -->
          <div class="spec-sidebar">
            <app-leaderboard [entries]="gameState.leaderboard()" />
          </div>
        </div>
      } @else {
        <div class="waiting glass">
          <p>En attente de la prochaine question...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .spectator-container {
      min-height: 100vh;
      padding: 1.5rem;
      position: relative;
      z-index: 1;
    }
    .spec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .spec-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      font-weight: 600;
      color: var(--accent-cyan);
      font-size: 0.9rem;
    }
    .spec-body {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 1.5rem;
      align-items: start;
    }
    .spec-main {
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
    .buzz-status {
      padding: 1.25rem;
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .buzzed {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent-yellow);
    }
    .buzz-emit { font-size: 1.75rem; }
    .no-buzz { color: var(--text-muted); }
    .spec-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .waiting {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 50vh;
      border-radius: var(--radius-xl);
      color: var(--text-muted);
      margin-top: 5rem;
    }
    @media (max-width: 900px) {
      .spec-body { grid-template-columns: 1fr; }
    }
  `]
})
export class SpectatorViewComponent {
  shapes = ['▲', '◆', '●', '■'];

  constructor(public gameState: GameStateService) {}
}
