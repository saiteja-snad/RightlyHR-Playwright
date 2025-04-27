import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewRoundComponent } from './interview-round.component';

describe('InterviewRoundComponent', () => {
  let component: InterviewRoundComponent;
  let fixture: ComponentFixture<InterviewRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
