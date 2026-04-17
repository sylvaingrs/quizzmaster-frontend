import { Component, signal, computed } from '@angular/core';
import { GameStateService } from '../../../services/game-state.service';
import { ApiService } from '../../../services/api.service';
import { TimerComponent } from '../../../components/timer/timer.component';
import { BuzzerButtonComponent } from '../../../components/buzzer-button/buzzer-button.component';
import { AnswerCardComponent } from '../../../components/answer-card/answer-card.component';
import { LeaderboardComponent } from '../../../components/leaderboard/leaderboard.component';

@Component({
  selector: 'app-player-view',
  imports: [TimerComponent, BuzzerButtonComponent, AnswerCardComponent, LeaderboardComponent],
  template: `
    <div class="player-container">
      @if (gameState.currentQuestion(); as q) {
        <!-- Header -->
        <div class="player-header">
          <div class="player-info">
            <span class="player-name">🎮 {{ gameState.playerName() }}</span>
          </div>
          <app-timer [duration]="q.timeLimit" [questionId]="q.id" [paused]="gameState.isBuzzerTaken() || gameState.answerResult() !== null" />
        </div>

        <!-- Question -->
        <div class="question-section animate-scale-in">
          <h2 class="question-title">{{ q.title }}</h2>
        </div>

        <!-- Game State -->
        <div class="interaction-area">
          @if (gameState.answerResult() !== null) {
            <!-- Result Feedback -->
            <div class="result-section animate-scale-in">
              @if (gameState.isMyBuzz()) {
                @if (gameState.answerResult()) {
                  <div class="result-correct">
                    <span class="result-icon">✅</span>
                    <span class="result-text">Bonne réponse !</span>
                  </div>
                } @else {
                  <div class="result-wrong">
                    <span class="result-icon">❌</span>
                    <span class="result-text">Mauvaise réponse</span>
                  </div>
                }
              } @else {
                <div class="result-other" [style.color]="gameState.answerResult() ? 'var(--accent-green)' : 'var(--accent-red)'">
                  <span class="result-text">{{ gameState.lastAnswerUserName() }} a eu {{ gameState.answerResult() ? 'bon ! ✅' : 'faux ❌' }}</span>
                </div>
              }
            </div>
          } @else if (!gameState.isBuzzerTaken()) {
            <!-- Buzzer Phase -->
            <div class="buzzer-section animate-scale-in">
              <p class="buzzer-hint">Appuyez sur le buzzer pour répondre !</p>
              <app-buzzer-button
                [disabled]="!gameState.canBuzz()"
                [taken]="false"
                (buzzClick)="onBuzz()"
              />
            </div>
          } @else if (gameState.isMyBuzz()) {
            <!-- Answer Phase (I buzzed, choose answer) -->
            <div class="answer-section animate-slide-up">
              <p class="answer-hint">🔔 C'est à vous ! Choisissez votre réponse :</p>
            </div>
          } @else {
            <!-- Someone else buzzed -->
            <div class="waiting-section animate-fade-in">
              <div class="other-buzzed glass">
                <span class="buzz-icon">🔔</span>
                <span>{{ gameState.buzzerHolderName() }} a buzzé !</span>
              </div>
            </div>
          }

          <!-- Options Grid Always Visible -->
          <div class="answers-grid" [class.compact]="!gameState.isBuzzerTaken()">
            @for (opt of q.options; track opt; let i = $index) {
              <app-answer-card
                [text]="opt"
                [colorIndex]="i"
                [selected]="selectedAnswers().includes(opt)"
                [isCorrect]="gameState.correctAnswers().includes(opt)"
                [showResult]="gameState.answerResult() !== null"
                [disabled]="!gameState.isMyBuzz() || gameState.answerResult() !== null || answering()"
                (cardClick)="toggleAnswer(opt)"
              />
            }
          </div>

          @if (gameState.isMyBuzz() && gameState.answerResult() === null) {
            <button
              class="btn-primary"
              style="margin-top: 1rem; width: 100%"
              [disabled]="answering() || selectedAnswers().length === 0"
              (click)="submitAnswer()"
            >
              Valider ({{ selectedAnswers().length }})
            </button>
          }
        </div>

        <!-- Mini Leaderboard -->
        <div class="leaderboard-section">
          <app-leaderboard [entries]="gameState.leaderboard()" [mini]="true" />
        </div>
      } @else {
        <div class="waiting-start glass">
          <p>En attente de la question...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .player-container {
      min-height: 100vh;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      position: relative;
      z-index: 1;
      max-width: 700px;
      margin: 0 auto;
    }
    .player-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .player-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .player-name {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-primary);
    }
    .question-section {
      text-align: center;
      padding: 1.5rem;
    }
    .question-title {
      font-size: 1.65rem;
      font-weight: 800;
      line-height: 1.3;
    }
    .buzzer-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      padding: 2rem 0;
    }
    .buzzer-hint {
      color: var(--text-secondary);
      font-size: 1rem;
      font-weight: 500;
    }
    .answer-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .answer-hint {
      text-align: center;
      font-weight: 600;
      color: var(--accent-yellow);
    }
    .answers-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .result-section {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    .result-correct, .result-wrong, .result-other {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 2rem;
      border-radius: var(--radius-xl);
      font-size: 1.5rem;
      font-weight: 800;
    }
    .result-other {
      background: rgba(0,0,0,0.2);
    }
    .result-correct {
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent-green);
      border: 2px solid rgba(16, 185, 129, 0.3);
    }
    .result-wrong {
      background: rgba(239, 68, 68, 0.15);
      color: var(--accent-red);
      border: 2px solid rgba(239, 68, 68, 0.3);
      animation: shake 0.5s ease;
    }
    .result-icon { font-size: 2rem; }
    .waiting-section {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    .other-buzzed {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-xl);
      font-weight: 600;
    }
    .buzz-icon { font-size: 1.5rem; }
    .leaderboard-section {
      margin-top: auto;
    }
    .waiting-start {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 50vh;
      border-radius: var(--radius-xl);
      color: var(--text-muted);
    }
    @media (max-width: 500px) {
      .answers-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PlayerViewComponent {
  selectedAnswers = signal<string[]>([]);
  answering = signal(false);

  constructor(
    public gameState: GameStateService,
    private api: ApiService
  ) {}

  onBuzz(): void {
    this.api.buzz(this.gameState.roomId(), this.gameState.playerId()).subscribe({
      next: (res) => {
        // buzz result is broadcast via WS
      },
    });
  }

  toggleAnswer(opt: string): void {
    if (!this.gameState.isMyBuzz() || this.gameState.answerResult() !== null || this.answering()) return;
    const current = this.selectedAnswers();
    if (current.includes(opt)) {
      this.selectedAnswers.set(current.filter(x => x !== opt));
    } else {
      this.selectedAnswers.set([...current, opt]);
    }
  }

  submitAnswer(): void {
    if (!this.gameState.isMyBuzz() || this.gameState.answerResult() !== null || this.answering() || this.selectedAnswers().length === 0) return;
    this.answering.set(true);

    this.api
      .answer(this.gameState.roomId(), this.gameState.playerId(), this.selectedAnswers())
      .subscribe({
        next: (res) => {
          this.gameState.setAnswerResult(res.correct);
          this.answering.set(false);
          this.selectedAnswers.set([]); // Reset for potential next time
        },
        error: () => {
          this.answering.set(false);
        },
      });
  }
}
