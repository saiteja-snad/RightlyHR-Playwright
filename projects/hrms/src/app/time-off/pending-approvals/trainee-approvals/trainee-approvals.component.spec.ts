import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeApprovalsComponent } from './trainee-approvals.component';

describe('TraineeApprovalsComponent', () => {
  let component: TraineeApprovalsComponent;
  let fixture: ComponentFixture<TraineeApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraineeApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraineeApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
