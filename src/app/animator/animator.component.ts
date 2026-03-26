import { Component } from '@angular/core';

@Component({
  selector: 'app-animator',
  templateUrl: './animator.component.html'
})
export class AnimatorComponent {
  question = 'Quelle est la capitale de la France ?';
  answers = ['Paris', 'Londres', 'Berlin', 'Madrid'];
}
