import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { GameStateService } from '../../services/game-state.service';
import { RoomCodeDisplayComponent } from '../../components/room-code-display/room-code-display.component';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby',
  imports: [RoomCodeDisplayComponent],
  template: `
    <div class="bg-particles"></div>
    <div class="lobby-container">
      <div class="lobby-content animate-slide-up">
        <!-- Room Code -->
        <app-room-code [code]="gameState.roomId()" />

        <!-- Status -->
        <div class="status-panel glass">
          <h2>Salle d'attente</h2>
          @if (gameState.isGameMaster()) {
            <p class="hint">Partagez le code ci-dessus pour que les joueurs rejoignent</p>
          } @else {
            <p class="hint">En attente du lancement par le Game Master...</p>
          }

          <!-- Players List -->
          <div class="players-section">
            <h3>Joueurs connectés ({{ gameState.players().length }})</h3>
            <div class="players-grid">
              @for (player of gameState.players(); track player.id) {
                <div class="player-chip" [class]="'role-' + player.role.toLowerCase()">
                  <span class="player-avatar">
                    @if (player.role === 'GAMEMASTER') { 👑 }
                    @else if (player.role === 'PLAYER') { 🎮 }
                    @else { 👁️ }
                  </span>
                  <span class="player-name">{{ player.name }}</span>
                  <span class="player-role-badge">{{ getRoleLabel(player.role) }}</span>
                </div>
              }
            </div>
          </div>

          <!-- GameMaster Actions -->
          @if (gameState.isGameMaster()) {
            <button
              class="btn-start"
              (click)="startGame()"
              [disabled]="loading() || getPlayerCount() < 1"
              id="btn-start-game"
            >
              @if (loading()) {
                Lancement...
              } @else {
                🚀 Lancer la partie
              }
            </button>
            @if (getPlayerCount() < 1) {
              <p class="hint">Au moins 1 joueur requis pour démarrer</p>
            }
          } @else {
            <div class="waiting-animation">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          }
        </div>
      </div>

      @if (error()) {
        <p class="error-msg animate-shake">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    .lobby-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      z-index: 1;
    }
    .lobby-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      width: 100%;
      max-width: 560px;
    }
    .status-panel {
      width: 100%;
      padding: 2rem;
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }
    .status-panel h2 {
      font-size: 1.5rem;
      font-weight: 800;
    }
    .hint {
      color: var(--text-muted);
      text-align: center;
      font-size: 0.9rem;
    }
    .players-section {
      width: 100%;
    }
    .players-section h3 {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
    }
    .players-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .player-chip {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.85rem;
      background: var(--bg-card);
      border-radius: var(--radius-full);
      border: 1px solid rgba(255,255,255,0.06);
      transition: all var(--transition-fast);
    }
    .player-chip.role-gamemaster {
      border-color: rgba(245, 158, 11, 0.3);
      background: rgba(245, 158, 11, 0.08);
    }
    .player-chip.role-player {
      border-color: rgba(124, 58, 237, 0.3);
      background: rgba(124, 58, 237, 0.08);
    }
    .player-chip.role-spectator {
      border-color: rgba(6, 182, 212, 0.3);
      background: rgba(6, 182, 212, 0.08);
    }
    .player-avatar { font-size: 1.1rem; }
    .player-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.9rem;
    }
    .player-role-badge {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .btn-start {
      padding: 1rem 3rem;
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      border-radius: var(--radius-full);
      color: white;
      font-size: 1.15rem;
      font-weight: 800;
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: 0 4px 24px rgba(16, 185, 129, 0.3);
    }
    .btn-start:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.5);
    }
    .btn-start:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .waiting-animation {
      display: flex;
      gap: 0.5rem;
    }
    .dot {
      width: 12px;
      height: 12px;
      background: var(--accent-violet);
      border-radius: 50%;
      animation: float 1.5s ease-in-out infinite;
    }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    .error-msg {
      color: var(--accent-red);
      text-align: center;
      font-size: 0.9rem;
      margin-top: 1rem;
    }
  `]
})
export class LobbyComponent implements OnInit, OnDestroy {
  loading = signal(false);
  error = signal('');
  private pollSub?: Subscription;

  constructor(
    private api: ApiService,
    public gameState: GameStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const roomId = this.route.snapshot.params['id'];

    // Restore if needed
    if (!this.gameState.roomId()) {
      this.gameState.restore();
    }

    // Poll for player list updates
    this.pollSub = interval(3000).subscribe(() => {
      this.api.getRoom(roomId).subscribe({
        next: (room) => {
          this.gameState.updatePlayers(room.players);
          if (room.status === 'PLAYING') {
            this.router.navigate(['/room', roomId, 'game']);
          }
        },
      });
    });

    // Listen for game.started via WS
    this.gameState.roomStatus;
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'GAMEMASTER': return 'Host';
      case 'PLAYER': return 'Joueur';
      case 'SPECTATOR': return 'Spectateur';
      default: return role;
    }
  }

  getPlayerCount(): number {
    return this.gameState.players().filter(p => p.role === 'PLAYER').length;
  }

  startGame(): void {
    this.loading.set(true);
    this.api.startGame(this.gameState.roomId()).subscribe({
      next: () => {
        this.router.navigate(['/room', this.gameState.roomId(), 'game']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur au lancement');
        this.loading.set(false);
      },
    });
  }
}
