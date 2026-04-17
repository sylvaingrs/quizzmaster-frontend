import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  template: `
    <div class="bg-particles"></div>
    <div class="home-container">
      <!-- Logo / Title -->
      <div class="hero animate-slide-up">
        <h1 class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">QuizzMaster</span>
        </h1>
        <p class="tagline">Le quiz en temps réel avec buzzer</p>
      </div>

      <!-- Mode Selector -->
      <div class="mode-selector animate-slide-up" style="animation-delay: 100ms">
        <button
          class="mode-btn"
          [class.active]="mode() === 'create'"
          (click)="mode.set('create')"
          id="btn-create-mode"
        >
          <span class="mode-icon">🎯</span>
          <span>Créer un Quiz</span>
        </button>
        <button
          class="mode-btn"
          [class.active]="mode() === 'join'"
          (click)="mode.set('join')"
          id="btn-join-mode"
        >
          <span class="mode-icon">🚀</span>
          <span>Rejoindre</span>
        </button>
      </div>

      <!-- Create Quiz Panel -->
      @if (mode() === 'create') {
        <div class="panel glass animate-scale-in">
          <h2>Créer un nouveau Quiz</h2>
          <p class="hint">Vous serez le Game Master de la partie</p>

          <div class="input-group">
            <label for="create-pseudo">Votre pseudo</label>
            <input
              id="create-pseudo"
              type="text"
              [(ngModel)]="createPseudo"
              placeholder="Entrez votre pseudo"
              class="input"
            />
          </div>

          <button class="btn-primary" (click)="goToCreateQuiz()" id="btn-go-create">
            Créer un Quiz →
          </button>
        </div>
      }

      <!-- Join Room Panel -->
      @if (mode() === 'join') {
        <div class="panel glass animate-scale-in">
          <h2>Rejoindre une salle</h2>

          <div class="input-group">
            <label for="join-code">Code de la salle</label>
            <input
              id="join-code"
              type="text"
              [(ngModel)]="joinCode"
              placeholder="Ex: A1B2C3"
              class="input code-input"
              maxlength="6"
              (input)="joinCode = joinCode.toUpperCase()"
            />
          </div>

          <div class="input-group">
            <label for="join-pseudo">Votre pseudo</label>
            <input
              id="join-pseudo"
              type="text"
              [(ngModel)]="joinPseudo"
              placeholder="Entrez votre pseudo"
              class="input"
            />
          </div>

          <div class="role-selector">
            <label>Votre rôle</label>
            <div class="role-options">
              <button
                class="role-btn"
                [class.active]="joinRole === 'PLAYER'"
                (click)="joinRole = 'PLAYER'"
                id="btn-role-player"
              >
                <span class="role-icon">🎮</span>
                <span class="role-label">Joueur</span>
                <span class="role-desc">Répondre aux questions</span>
              </button>
              <button
                class="role-btn"
                [class.active]="joinRole === 'SPECTATOR'"
                (click)="joinRole = 'SPECTATOR'"
                id="btn-role-spectator"
              >
                <span class="role-icon">👁️</span>
                <span class="role-label">Spectateur</span>
                <span class="role-desc">Observer la partie</span>
              </button>
            </div>
          </div>

          <button
            class="btn-primary"
            (click)="joinRoom()"
            [disabled]="!joinCode || !joinPseudo"
            id="btn-join-room"
          >
            Rejoindre →
          </button>

          @if (error()) {
            <p class="error-msg animate-shake">{{ error() }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      z-index: 1;
      gap: 2rem;
    }
    .hero {
      text-align: center;
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: 3rem;
      font-weight: 900;
    }
    .logo-icon { font-size: 3rem; }
    .logo-text {
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .tagline {
      color: var(--text-secondary);
      font-size: 1.15rem;
      margin-top: 0.5rem;
    }
    .mode-selector {
      display: flex;
      gap: 1rem;
    }
    .mode-btn {
      padding: 0.75rem 2rem;
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: var(--radius-full);
      background: transparent;
      color: var(--text-secondary);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-base);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .mode-btn:hover {
      border-color: rgba(124, 58, 237, 0.5);
      color: var(--text-primary);
    }
    .mode-btn.active {
      background: var(--accent-violet);
      border-color: var(--accent-violet);
      color: white;
      box-shadow: var(--shadow-glow-violet);
    }
    .mode-icon { font-size: 1.25rem; }
    .panel {
      width: 100%;
      max-width: 480px;
      padding: 2rem;
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .panel h2 {
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
    }
    .hint {
      color: var(--text-muted);
      text-align: center;
      font-size: 0.9rem;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .input-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .input {
      padding: 0.75rem 1rem;
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
    .code-input {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: 0.2em;
    }
    .role-selector label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .role-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .role-btn {
      padding: 1rem;
      border: 2px solid rgba(255,255,255,0.08);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      transition: all var(--transition-base);
    }
    .role-btn:hover {
      border-color: rgba(124,58,237,0.3);
    }
    .role-btn.active {
      border-color: var(--accent-violet);
      background: rgba(124,58,237,0.1);
      box-shadow: 0 0 16px rgba(124,58,237,0.15);
    }
    .role-icon { font-size: 1.75rem; }
    .role-label {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.95rem;
    }
    .role-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .btn-primary {
      padding: 0.85rem 2rem;
      background: var(--gradient-primary);
      border: none;
      border-radius: var(--radius-full);
      color: white;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-base);
      text-align: center;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow-violet);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .error-msg {
      color: var(--accent-red);
      text-align: center;
      font-size: 0.9rem;
      font-weight: 500;
    }
  `]
})
export class HomeComponent {
  mode = signal<'create' | 'join'>('join');
  error = signal('');

  createPseudo = '';
  joinCode = '';
  joinPseudo = '';
  joinRole: 'PLAYER' | 'SPECTATOR' = 'PLAYER';

  constructor(
    private api: ApiService,
    private gameState: GameStateService,
    private router: Router
  ) {}

  goToCreateQuiz(): void {
    if (!this.createPseudo.trim()) return;
    sessionStorage.setItem('qm_createPseudo', this.createPseudo.trim());
    this.router.navigate(['/quiz/create']);
  }

  joinRoom(): void {
    if (!this.joinCode.trim() || !this.joinPseudo.trim()) return;
    this.error.set('');

    this.api.joinRoom(this.joinCode.trim(), this.joinPseudo.trim(), this.joinRole).subscribe({
      next: (room) => {
        const me = room.players.find(p => p.name === this.joinPseudo.trim());
        if (me) {
          this.gameState.init(room.id, me.id, me.name, me.role, room.players);
          this.router.navigate(['/room', room.id, 'lobby']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Impossible de rejoindre la salle');
      }
    });
  }
}
