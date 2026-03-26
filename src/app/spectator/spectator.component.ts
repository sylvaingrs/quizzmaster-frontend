import { Component } from '@angular/core';

@Component({
  selector: 'app-spectator',
  templateUrl: './spectator.component.html'
})
export class SpectatorComponent {
  question = 'Quelle est la capitale de la France ?';
  answers = ['Paris', 'Londres', 'Berlin', 'Madrid'];
}
