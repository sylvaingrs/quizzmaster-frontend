import { Component, input } from '@angular/core';
import { LeaderboardEntry } from '../../models/models';

@Component({
  selector: 'app-leaderboard',
  template: `
    <div class="leaderboard" [class.mini]="mini()">
      <h3 class="leaderboard-title">
        <span class="icon">🏆</span> Classement
      </h3>
      <div class="entries">
        @for (entry of entries(); track entry.userId; let i = $index) {
          <div class="entry animate-slide-up" [style.animation-delay]="i * 80 + 'ms'">
            <div class="rank" [class]="getRankClass(i)">
              @if (i === 0) { 🥇 }
              @else if (i === 1) { 🥈 }
              @else if (i === 2) { 🥉 }
              @else { {{ i + 1 }} }
            </div>
            <span class="name">{{ entry.userId }}</span>
            <div class="score-bar-container">
              <div
                class="score-bar"
                [style.width.%]="getBarWidth(entry.score)"
              ></div>
            </div>
            <span class="score">{{ entry.score }}</span>
          </div>
        } @empty {
          <p class="empty">Aucun score pour le moment</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .leaderboard {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .leaderboard-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .icon { font-size: 1.25rem; }
    .entries { display: flex; flex-direction: column; gap: 0.5rem; }
    .entry {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);
    }
    .entry:hover { background: var(--bg-card-hover); }
    .rank {
      min-width: 2rem;
      text-align: center;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .rank-gold { color: #fbbf24; }
    .rank-silver { color: #94a3b8; }
    .rank-bronze { color: #d97706; }
    .name {
      flex: 1;
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .score-bar-container {
      flex: 1;
      height: 6px;
      background: rgba(255,255,255,0.08);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .score-bar {
      height: 100%;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
      transition: width 0.6s ease;
    }
    .score {
      font-weight: 700;
      color: var(--accent-cyan);
      min-width: 2rem;
      text-align: right;
    }
    .empty {
      color: var(--text-muted);
      text-align: center;
      padding: 1rem;
      font-style: italic;
    }
    .mini { padding: 0.75rem; }
    .mini .leaderboard-title { font-size: 0.85rem; margin-bottom: 0.5rem; }
    .mini .entry { padding: 0.35rem 0.5rem; }
    .mini .score-bar-container { display: none; }
  `]
})
export class LeaderboardComponent {
  entries = input.required<LeaderboardEntry[]>();
  mini = input(false);

  getRankClass(index: number): string {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return '';
  }

  getBarWidth(score: number): number {
    const entries = this.entries();
    const max = entries.length ? Math.max(...entries.map(e => e.score), 1) : 1;
    return (score / max) * 100;
  }
}
