import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'quiz/create',
    loadComponent: () =>
      import('./pages/quiz-create/quiz-create.component').then(
        (m) => m.QuizCreateComponent
      ),
  },
  {
    path: 'room/:id/lobby',
    loadComponent: () =>
      import('./pages/lobby/lobby.component').then((m) => m.LobbyComponent),
  },
  {
    path: 'room/:id/game',
    loadComponent: () =>
      import('./pages/game/game.component').then((m) => m.GameComponent),
  },
  {
    path: 'room/:id/results',
    loadComponent: () =>
      import('./pages/results/results.component').then(
        (m) => m.ResultsComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
