import { Component } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html'
})
export class PlayerComponent {
  question = 'Quelle est la capitale de la France ?';
  answers = ['Paris', 'Londres', 'Berlin', 'Madrid'];
}
