import { Component, OnInit, effect } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';
import { GamemasterViewComponent } from './gamemaster-view/gamemaster-view.component';
import { PlayerViewComponent } from './player-view/player-view.component';
import { SpectatorViewComponent } from './spectator-view/spectator-view.component';

@Component({
  selector: 'app-game',
  imports: [GamemasterViewComponent, PlayerViewComponent, SpectatorViewComponent],
  template: `
    <div class="bg-particles"></div>
    @if (gameState.isGameMaster()) {
      <app-gamemaster-view />
    } @else if (gameState.isPlayer()) {
      <app-player-view />
    } @else {
      <app-spectator-view />
    }
  `,
  styles: [`:host { display: block; }`]
})
export class GameComponent implements OnInit {
  constructor(
    public gameState: GameStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Navigate to results when game ends
    effect(() => {
      if (this.gameState.gameFinished()) {
        const roomId = this.gameState.roomId();
        this.router.navigate(['/room', roomId, 'results']);
      }
    });
  }

  ngOnInit(): void {
    if (!this.gameState.roomId()) {
      const restored = this.gameState.restore();
      if (!restored) {
        this.router.navigate(['/']);
      }
    }
  }
}
