import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-buzzer-button',
  template: `
    <button
      class="buzzer"
      [class.disabled]="disabled()"
      [class.taken]="taken()"
      (click)="!disabled() && !taken() && buzzClick.emit()"
      [attr.aria-label]="disabled() ? 'Buzzer désactivé' : 'Buzzer'"
    >
      <span class="buzzer-inner">
        @if (taken()) {
          <span class="buzzer-icon">🔒</span>
          <span class="buzzer-label">PRIS</span>
        } @else if (disabled()) {
          <span class="buzzer-icon">⏳</span>
          <span class="buzzer-label">ATTENTE</span>
        } @else {
          <span class="buzzer-icon">🔔</span>
          <span class="buzzer-label">BUZZ!</span>
        }
      </span>
    </button>
  `,
  styles: [`
    .buzzer {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: linear-gradient(145deg, #ef4444, #dc2626);
      box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4), inset 0 -4px 8px rgba(0,0,0,0.2);
      transition: all var(--transition-base);
      animation: pulse-glow 2s ease-in-out infinite;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .buzzer:hover:not(.disabled):not(.taken) {
      transform: scale(1.08);
      box-shadow: 0 12px 48px rgba(239, 68, 68, 0.6);
    }
    .buzzer:active:not(.disabled):not(.taken) {
      transform: scale(0.95);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
    }
    .buzzer.disabled {
      background: linear-gradient(145deg, #4b5563, #374151);
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      cursor: not-allowed;
      animation: none;
    }
    .buzzer.taken {
      background: linear-gradient(145deg, #f59e0b, #d97706);
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
      cursor: not-allowed;
      animation: none;
    }
    .buzzer-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    .buzzer-icon {
      font-size: 2.5rem;
      line-height: 1;
    }
    .buzzer-label {
      font-size: 1.1rem;
      font-weight: 800;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  `]
})
export class BuzzerButtonComponent {
  disabled = input(false);
  taken = input(false);
  buzzClick = output<void>();
}
