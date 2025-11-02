import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursApprovalComponent } from './extra-hours-approval.component';

describe('ExtraHoursApprovalComponent', () => {
  let component: ExtraHoursApprovalComponent;
  let fixture: ComponentFixture<ExtraHoursApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
