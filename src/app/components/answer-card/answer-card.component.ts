import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-answer-card',
  template: `
    <button
      class="answer-card"
      [class]="'answer-card color-' + colorIndex()"
      [class.selected]="selected()"
      [class.correct]="showResult() && isCorrect()"
      [class.wrong]="showResult() && selected() && !isCorrect()"
      [class.disabled]="disabled()"
      (click)="!disabled() && cardClick.emit()"
    >
      <span class="shape">{{ shapes[colorIndex()] }}</span>
      <span class="text">{{ text() }}</span>
      @if (showResult() && isCorrect()) {
        <span class="result-icon correct-icon">✓</span>
      }
      @if (showResult() && selected() && !isCorrect()) {
        <span class="result-icon wrong-icon">✗</span>
      }
    </button>
  `,
  styles: [`
    .answer-card {
      width: 100%;
      padding: 1.25rem 1.5rem;
      border: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: white;
      transition: all var(--transition-base);
      position: relative;
      overflow: hidden;
      min-height: 72px;
    }
    .answer-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0);
      transition: background var(--transition-fast);
    }
    .answer-card:hover:not(.disabled)::before {
      background: rgba(255,255,255,0.1);
    }
    .answer-card:active:not(.disabled) {
      transform: scale(0.97);
    }
    .color-0 { background: var(--answer-red); }
    .color-1 { background: var(--answer-blue); }
    .color-2 { background: var(--answer-green); }
    .color-3 { background: var(--answer-yellow); }
    .shape {
      font-size: 1.5rem;
      min-width: 2rem;
      text-align: center;
    }
    .text {
      flex: 1;
      text-align: left;
    }
    .selected {
      outline: 3px solid white;
      outline-offset: -3px;
      transform: scale(1.02);
    }
    .correct {
      outline: 3px solid var(--accent-green);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
    }
    .wrong {
      outline: 3px solid var(--accent-red);
      opacity: 0.6;
      animation: shake 0.5s ease;
    }
    .disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
    .result-icon {
      font-size: 1.5rem;
      font-weight: bold;
      margin-left: auto;
      padding: 0.25rem;
      border-radius: 50%;
      background: white;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .correct-icon {
      color: var(--accent-green);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }
    .wrong-icon {
      color: var(--accent-red);
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
    }
  `]
})
export class AnswerCardComponent {
  text = input.required<string>();
  colorIndex = input(0);
  selected = input(false);
  isCorrect = input(false);
  showResult = input(false);
  disabled = input(false);
  cardClick = output<void>();

  shapes = ['▲', '◆', '●', '■'];
}
