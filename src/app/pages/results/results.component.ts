import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';
import { LeaderboardComponent } from '../../components/leaderboard/leaderboard.component';

@Component({
  selector: 'app-results',
  imports: [LeaderboardComponent],
  template: `
    <div class="bg-particles"></div>

    <!-- Confetti -->
    <div class="confetti-container">
      @for (c of confetti; track c.id) {
        <div
          class="confetti-piece"
          [style.left.%]="c.x"
          [style.animation-delay]="c.delay + 's'"
          [style.animation-duration]="c.duration + 's'"
          [style.background]="c.color"
        ></div>
      }
    </div>

    <div class="results-container">
      <div class="results-content animate-slide-up">
        <h1 class="results-title">🏆 Résultats Finaux</h1>

        <!-- Podium -->
        @if (podium().length > 0) {
          <div class="podium">
            <!-- 2nd Place -->
            @if (podium().length > 1) {
              <div class="podium-slot silver animate-slide-up" style="animation-delay: 300ms">
                <div class="podium-avatar">🥈</div>
                <div class="podium-name">{{ podium()[1].userId }}</div>
                <div class="podium-score">{{ podium()[1].score }} pts</div>
                <div class="podium-bar bar-2"></div>
              </div>
            }
            <!-- 1st Place -->
            @if (podium().length > 0) {
              <div class="podium-slot gold animate-slide-up" style="animation-delay: 100ms">
                <div class="podium-crown">👑</div>
                <div class="podium-avatar">🥇</div>
                <div class="podium-name">{{ podium()[0].userId }}</div>
                <div class="podium-score">{{ podium()[0].score }} pts</div>
                <div class="podium-bar bar-1"></div>
              </div>
            }
            <!-- 3rd Place -->
            @if (podium().length > 2) {
              <div class="podium-slot bronze animate-slide-up" style="animation-delay: 500ms">
                <div class="podium-avatar">🥉</div>
                <div class="podium-name">{{ podium()[2].userId }}</div>
                <div class="podium-score">{{ podium()[2].score }} pts</div>
                <div class="podium-bar bar-3"></div>
              </div>
            }
          </div>
        }

        <!-- Full Leaderboard -->
        <div class="full-leaderboard">
          <app-leaderboard [entries]="gameState.finalLeaderboard()" />
        </div>

        <button class="btn-home" (click)="goHome()" id="btn-go-home">
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confetti-container {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10;
      overflow: hidden;
    }
    .confetti-piece {
      position: absolute;
      width: 10px;
      height: 10px;
      top: -20px;
      border-radius: 2px;
      animation: confetti-fall linear forwards;
    }
    .results-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      z-index: 1;
    }
    .results-content {
      width: 100%;
      max-width: 640px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }
    .results-title {
      font-size: 2.25rem;
      font-weight: 900;
      text-align: center;
      background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .podium {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 1rem;
      width: 100%;
      padding-top: 2rem;
    }
    .podium-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .podium-crown {
      font-size: 2rem;
      animation: float 2s ease-in-out infinite;
    }
    .podium-avatar {
      font-size: 2.5rem;
    }
    .podium-name {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-primary);
    }
    .podium-score {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--accent-cyan);
    }
    .podium-bar {
      width: 120px;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
    }
    .bar-1 {
      height: 140px;
      background: linear-gradient(180deg, #fbbf24, #d97706);
    }
    .bar-2 {
      height: 100px;
      background: linear-gradient(180deg, #94a3b8, #64748b);
    }
    .bar-3 {
      height: 70px;
      background: linear-gradient(180deg, #d97706, #92400e);
    }
    .full-leaderboard {
      width: 100%;
    }
    .btn-home {
      padding: 0.9rem 2.5rem;
      background: var(--gradient-primary);
      border: none;
      border-radius: var(--radius-full);
      color: white;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-base);
    }
    .btn-home:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow-violet);
    }
  `]
})
export class ResultsComponent implements OnInit {
  podium = signal<Array<{ userId: string; score: number }>>([]);

  confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    color: ['#fbbf24', '#ef4444', '#3b82f6', '#10b981', '#ec4899', '#7c3aed'][
      Math.floor(Math.random() * 6)
    ],
  }));

  constructor(
    public gameState: GameStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (!this.gameState.roomId()) {
      this.gameState.restore();
    }

    const lb = this.gameState.finalLeaderboard();
    if (lb.length > 0) {
      this.podium.set(lb.slice(0, 3));
    } else {
      // Fallback: fetch from leaderboard signal
      const current = this.gameState.leaderboard();
      this.podium.set(current.slice(0, 3));
    }
  }

  goHome(): void {
    this.gameState.cleanup();
    this.router.navigate(['/']);
  }
}
