import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { GameStateService } from '../../services/game-state.service';
import { CreateQuestionDto } from '../../models/models';

@Component({
  selector: 'app-quiz-create',
  imports: [FormsModule],
  template: `
    <div class="bg-particles"></div>
    <div class="create-container">
      <div class="header">
        <button class="btn-back" (click)="goBack()">← Retour</button>
        <h1>Créer un Quiz</h1>
      </div>

      <!-- Step 1: Quiz Title -->
      @if (step() === 1) {
        <div class="panel glass animate-scale-in">
          <div class="step-indicator">Étape 1 / 3</div>
          <h2>Nom du Quiz</h2>
          <input
            type="text"
            class="input input-lg"
            [(ngModel)]="quizTitle"
            placeholder="Ex: Culture Générale"
            id="quiz-title-input"
          />
          <button
            class="btn-primary"
            (click)="createQuiz()"
            [disabled]="!quizTitle.trim() || loading()"
            id="btn-create-quiz"
          >
            {{ loading() ? 'Création...' : 'Suivant →' }}
          </button>
        </div>
      }

      <!-- Step 2: Add Questions -->
      @if (step() === 2) {
        <div class="panel glass animate-scale-in questions-panel">
          <div class="step-indicator">Étape 2 / 3</div>
          <h2>Ajouter des Questions</h2>
          <p class="hint">Quiz : {{ quizTitle }} • {{ questions().length }} question(s)</p>

          <!-- Question Form -->
          <div class="question-form">
            <div class="input-group">
              <label>Question</label>
              <input
                type="text"
                class="input"
                [(ngModel)]="currentQuestion.title"
                placeholder="Posez votre question..."
                id="question-title"
              />
            </div>

            <div class="options-grid">
              @for (opt of currentQuestion.options; track $index) {
                <div class="option-input-group">
                  <label>Réponse {{ $index + 1 }}</label>
                  <div class="option-row">
                    <input
                      type="text"
                      class="input option-input color-{{ $index }}"
                      [ngModel]="opt"
                      (ngModelChange)="updateOption($index, $event)"
                      [placeholder]="'Réponse ' + ($index + 1)"
                    />
                    <button
                      class="correct-toggle"
                      [class.is-correct]="opt.trim() !== '' && currentQuestion.correctAnswer.includes(opt)"
                      [disabled]="opt.trim() === ''"
                      (click)="toggleCorrect(opt)"
                      title="Marquer comme correcte"
                      [style.cursor]="opt.trim() === '' ? 'not-allowed' : 'pointer'"
                      [style.opacity]="opt.trim() === '' ? '0.5' : '1'"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              }
            </div>

            <div class="form-row">
              <div class="input-group timer-group">
                <label>Temps (s)</label>
                <input
                  type="number"
                  class="input"
                  [(ngModel)]="currentQuestion.timeLimit"
                  min="5"
                  max="120"
                  id="question-time"
                />
              </div>
              <button
                class="btn-add"
                (click)="addQuestion()"
                [disabled]="!canAddQuestion()"
                id="btn-add-question"
              >
                + Ajouter
              </button>
            </div>
          </div>

          <!-- Added Questions List -->
          @if (questions().length > 0) {
            <div class="questions-list">
              @for (q of questions(); track q.id; let i = $index) {
                <div class="question-item animate-slide-up" [style.animation-delay]="i * 60 + 'ms'">
                  <span class="q-number">Q{{ i + 1 }}</span>
                  <span class="q-title">{{ q.title }}</span>
                  <span class="q-time">{{ q.timeLimit }}s</span>
                </div>
              }
            </div>
          }

          <button
            class="btn-primary"
            (click)="step.set(3)"
            [disabled]="questions().length === 0"
          >
            Suivant →
          </button>
        </div>
      }

      <!-- Step 3: Review & Create Room -->
      @if (step() === 3) {
        <div class="panel glass animate-scale-in">
          <div class="step-indicator">Étape 3 / 3</div>
          <h2>Récapitulatif</h2>

          <div class="summary">
            <div class="summary-row">
              <span class="label">Quiz</span>
              <span class="value">{{ quizTitle }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Questions</span>
              <span class="value">{{ questions().length }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Game Master</span>
              <span class="value">{{ pseudo }}</span>
            </div>
          </div>

          <div class="btn-group">
            <button class="btn-secondary" (click)="step.set(2)">← Modifier</button>
            <button
              class="btn-primary"
              (click)="createRoom()"
              [disabled]="loading()"
              id="btn-launch-room"
            >
              {{ loading() ? 'Création...' : '🚀 Lancer la salle' }}
            </button>
          </div>
        </div>
      }

      @if (error()) {
        <p class="error-msg animate-shake">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    .create-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      position: relative;
      z-index: 1;
      gap: 1.5rem;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      max-width: 600px;
    }
    .header h1 {
      font-size: 1.75rem;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .btn-back {
      padding: 0.5rem 1rem;
      background: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: var(--radius-full);
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.85rem;
      transition: all var(--transition-fast);
    }
    .btn-back:hover {
      border-color: var(--accent-violet);
      color: var(--text-primary);
    }
    .step-indicator {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-violet-light);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-align: center;
    }
    .panel {
      width: 100%;
      max-width: 600px;
      padding: 2rem;
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .panel h2 {
      font-size: 1.35rem;
      font-weight: 700;
      text-align: center;
    }
    .hint {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-align: center;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .input-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .input {
      padding: 0.7rem 1rem;
      background: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 1rem;
      outline: none;
      transition: border-color var(--transition-fast);
      font-family: inherit;
    }
    .input:focus {
      border-color: var(--accent-violet);
      box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
    }
    .input-lg {
      font-size: 1.25rem;
      padding: 1rem 1.25rem;
      text-align: center;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .option-row {
      display: flex;
      gap: 0.4rem;
    }
    .option-input {
      flex: 1;
    }
    .option-input.color-0 { border-left: 3px solid var(--answer-red); }
    .option-input.color-1 { border-left: 3px solid var(--answer-blue); }
    .option-input.color-2 { border-left: 3px solid var(--answer-green); }
    .option-input.color-3 { border-left: 3px solid var(--answer-yellow); }
    .correct-toggle {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      border: 2px solid rgba(255,255,255,0.15);
      background: var(--bg-card);
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: flex-end;
    }
    .correct-toggle.is-correct {
      background: var(--accent-green);
      border-color: var(--accent-green);
      color: white;
    }
    .form-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
    }
    .timer-group {
      width: 100px;
    }
    .btn-add {
      padding: 0.7rem 1.25rem;
      background: var(--accent-cyan);
      border: none;
      border-radius: var(--radius-md);
      color: white;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    .btn-add:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-add:disabled { opacity: 0.4; cursor: not-allowed; }
    .questions-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 300px;
      overflow-y: auto;
    }
    .question-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1rem;
      background: var(--bg-surface);
      border-radius: var(--radius-md);
    }
    .q-number {
      background: var(--accent-violet);
      color: white;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
    }
    .q-title { flex: 1; color: var(--text-primary); font-weight: 500; }
    .q-time { color: var(--text-muted); font-size: 0.8rem; }
    .summary {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.6rem 1rem;
      background: var(--bg-surface);
      border-radius: var(--radius-md);
    }
    .summary-row .label { color: var(--text-secondary); }
    .summary-row .value { font-weight: 600; color: var(--text-primary); }
    .btn-group {
      display: flex;
      gap: 0.75rem;
    }
    .btn-secondary {
      flex: 1;
      padding: 0.8rem;
      background: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: var(--radius-full);
      color: var(--text-secondary);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-secondary:hover {
      border-color: var(--accent-violet);
      color: var(--text-primary);
    }
    .btn-primary {
      flex: 1;
      padding: 0.85rem 2rem;
      background: var(--gradient-primary);
      border: none;
      border-radius: var(--radius-full);
      color: white;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-base);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow-violet);
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .error-msg {
      color: var(--accent-red);
      text-align: center;
      font-size: 0.9rem;
    }
    .questions-panel {
      max-width: 700px;
    }
  `]
})
export class QuizCreateComponent {
  step = signal(1);
  loading = signal(false);
  error = signal('');

  quizTitle = '';
  quizId = 0;
  pseudo = sessionStorage.getItem('qm_createPseudo') || '';

  currentQuestion: CreateQuestionDto = {
    title: '',
    options: ['', '', '', ''],
    correctAnswer: [],
    timeLimit: 30,
  };

  questions = signal<Array<CreateQuestionDto & { id: number }>>([]);

  constructor(
    private api: ApiService,
    private gameState: GameStateService,
    private router: Router
  ) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  createQuiz(): void {
    if (!this.quizTitle.trim()) return;
    this.loading.set(true);
    this.api.createQuiz(this.quizTitle.trim()).subscribe({
      next: (quiz) => {
        this.quizId = quiz.id;
        this.step.set(2);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la création');
        this.loading.set(false);
      },
    });
  }

  updateOption(index: number, value: string): void {
    const old = this.currentQuestion.options[index];
    this.currentQuestion.options[index] = value;
    // Update correctAnswer if the old value was marked correct
    const correctIdx = this.currentQuestion.correctAnswer.indexOf(old);
    if (correctIdx !== -1) {
      this.currentQuestion.correctAnswer[correctIdx] = value;
    }
  }

  toggleCorrect(option: string): void {
    if (!option.trim()) return;
    const idx = this.currentQuestion.correctAnswer.indexOf(option);
    if (idx === -1) {
      this.currentQuestion.correctAnswer.push(option);
    } else {
      this.currentQuestion.correctAnswer.splice(idx, 1);
    }
  }

  canAddQuestion(): boolean {
    return (
      this.currentQuestion.title.trim() !== '' &&
      this.currentQuestion.options.filter((o) => o.trim()).length >= 2 &&
      this.currentQuestion.correctAnswer.length > 0
    );
  }

  addQuestion(): void {
    if (!this.canAddQuestion()) return;
    const dto: CreateQuestionDto = {
      title: this.currentQuestion.title.trim(),
      options: this.currentQuestion.options.filter((o) => o.trim()),
      correctAnswer: [...this.currentQuestion.correctAnswer],
      timeLimit: this.currentQuestion.timeLimit,
    };

    this.api.createQuestion(this.quizId, dto).subscribe({
      next: (q) => {
        this.questions.update((list) => [...list, { ...dto, id: q.id }]);
        this.currentQuestion = {
          title: '',
          options: ['', '', '', ''],
          correctAnswer: [],
          timeLimit: 30,
        };
      },
      error: (err) => {
        this.error.set(err.error?.message || "Erreur lors de l'ajout");
      },
    });
  }

  createRoom(): void {
    if (!this.pseudo.trim()) {
      this.error.set('Pseudo requis pour créer la salle');
      return;
    }
    this.loading.set(true);
    this.api.createRoom(this.quizId, this.pseudo.trim()).subscribe({
      next: (room) => {
        const me = room.players.find((p) => p.role === 'GAMEMASTER');
        if (me) {
          this.gameState.init(room.id, me.id, me.name, me.role, room.players);
          this.router.navigate(['/room', room.id, 'lobby']);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la création de la salle');
        this.loading.set(false);
      },
    });
  }
}
