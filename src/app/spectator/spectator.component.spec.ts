import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectatorComponent } from './spectator.component';

describe('Spectator', () => {
  let component: SpectatorComponent;
  let fixture: ComponentFixture<SpectatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpectatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpectatorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
