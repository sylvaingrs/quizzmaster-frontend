import { Component, input } from '@angular/core';

@Component({
  selector: 'app-room-code',
  template: `
    <div class="room-code-container">
      <span class="label">Code de la salle</span>
      <div class="code-display" (click)="copyCode()">
        <span class="code">{{ code() }}</span>
        <span class="copy-icon" [class.copied]="copied">
          {{ copied ? '✅' : '📋' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .room-code-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-weight: 600;
    }
    .code-display {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--bg-card);
      border: 2px solid rgba(124, 58, 237, 0.3);
      border-radius: var(--radius-xl);
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      transition: all var(--transition-base);
    }
    .code-display:hover {
      border-color: var(--accent-violet);
      box-shadow: var(--shadow-glow-violet);
    }
    .code {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: 0.25em;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .copy-icon {
      font-size: 1.25rem;
      transition: transform var(--transition-fast);
    }
    .copy-icon.copied {
      transform: scale(1.2);
    }
  `]
})
export class RoomCodeDisplayComponent {
  code = input.required<string>();
  copied = false;

  copyCode(): void {
    navigator.clipboard.writeText(this.code()).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
