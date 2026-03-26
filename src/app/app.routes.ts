import { Routes } from '@angular/router';
import {SpectatorComponent} from './spectator/spectator.component';
import {AppComponent} from './app.component';
import {PlayerComponent} from './player/player.component';
import {AnimatorComponent} from './animator/animator.component';

export const routes: Routes = [
  { path: '', redirectTo: 'player', pathMatch: 'full' },
  {path: 'spectator', component: SpectatorComponent},
  {path: 'player', component: PlayerComponent},
  {path: 'animator', component: AnimatorComponent},
];
