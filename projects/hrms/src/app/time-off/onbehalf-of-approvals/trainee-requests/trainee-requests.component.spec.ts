import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeRequestsComponent } from './trainee-requests.component';

describe('TraineeRequestsComponent', () => {
  let component: TraineeRequestsComponent;
  let fixture: ComponentFixture<TraineeRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraineeRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraineeRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
