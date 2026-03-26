import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatorComponent } from './animator.component';

describe('Animator', () => {
  let component: AnimatorComponent;
  let fixture: ComponentFixture<AnimatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimatorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
