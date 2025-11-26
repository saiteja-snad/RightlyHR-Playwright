import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeRelievingLetterComponent } from './trainee-relieving-letter.component';

describe('TraineeRelievingLetterComponent', () => {
  let component: TraineeRelievingLetterComponent;
  let fixture: ComponentFixture<TraineeRelievingLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraineeRelievingLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraineeRelievingLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
