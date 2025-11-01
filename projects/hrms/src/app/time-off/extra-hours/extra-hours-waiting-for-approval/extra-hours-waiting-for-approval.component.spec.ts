import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursWaitingForApprovalComponent } from './extra-hours-waiting-for-approval.component';

describe('ExtraHoursWaitingForApprovalComponent', () => {
  let component: ExtraHoursWaitingForApprovalComponent;
  let fixture: ComponentFixture<ExtraHoursWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
