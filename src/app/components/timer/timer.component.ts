import { Component, input, signal, effect, OnDestroy, untracked } from '@angular/core';

@Component({
  selector: 'app-timer',
  template: `
    <div class="timer-container" [class.urgent]="remaining() <= 5">
      <svg class="timer-ring" viewBox="0 0 120 120">
        <circle class="ring-bg" cx="60" cy="60" r="52" />
        <circle
          class="ring-progress"
          cx="60" cy="60" r="52"
          [style.stroke-dashoffset]="dashOffset()"
        />
      </svg>
      <span class="timer-text">{{ remaining() }}</span>
    </div>
  `,
  styles: [`
    .timer-container {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .timer-ring {
      position: absolute;
      inset: 0;
      transform: rotate(-90deg);
    }
    .ring-bg {
      fill: none;
      stroke: rgba(255,255,255,0.1);
      stroke-width: 6;
    }
    .ring-progress {
      fill: none;
      stroke: var(--accent-cyan);
      stroke-width: 6;
      stroke-linecap: round;
      stroke-dasharray: 326.73;
      transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
    }
    .urgent .ring-progress {
      stroke: var(--accent-red);
    }
    .timer-text {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      z-index: 1;
    }
    .urgent .timer-text {
      color: var(--accent-red);
      animation: countdown-pulse 1s ease infinite;
    }
  `]
})
export class TimerComponent implements OnDestroy {
  duration = input.required<number>();
  questionId = input.required<number>();
  paused = input(false);

  remaining = signal(0);
  dashOffset = signal(0);

  private interval: ReturnType<typeof setInterval> | null = null;
  private circumference = 2 * Math.PI * 52; // ~326.73

  constructor() {
    effect(() => {
      const dur = this.duration();
      const qId = this.questionId(); // Track questionId so timer resets on new question
      untracked(() => {
        this.remaining.set(dur);
        this.dashOffset.set(0);
        this.startTimer(dur, dur);
      });
    });

    effect(() => {
      const isPaused = this.paused();
      untracked(() => {
        if (isPaused) {
          if (this.interval) clearInterval(this.interval);
        } else {
          if (this.remaining() > 0 && this.remaining() <= this.duration()) {
            this.startTimer(this.duration(), this.remaining());
          }
        }
      });
    });
  }

  private startTimer(total: number, currentLeft: number): void {
    if (this.interval) clearInterval(this.interval);
    if (untracked(this.paused)) return;
    
    const expectedEndTime = Date.now() + currentLeft * 1000;

    this.interval = setInterval(() => {
      const now = Date.now();
      let timeLeft = Math.ceil((expectedEndTime - now) / 1000);
      
      if (timeLeft <= 0) {
        if (this.interval) clearInterval(this.interval);
        timeLeft = 0;
      }
      this.remaining.set(timeLeft);
      this.dashOffset.set(
        this.circumference * (1 - timeLeft / total)
      );
    }, 100); // 100ms interval for smoother visual updates & drift check
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}
