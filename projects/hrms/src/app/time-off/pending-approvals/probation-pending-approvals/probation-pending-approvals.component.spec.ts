import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationPendingApprovalsComponent } from './probation-pending-approvals.component';

describe('ProbationPendingApprovalsComponent', () => {
  let component: ProbationPendingApprovalsComponent;
  let fixture: ComponentFixture<ProbationPendingApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationPendingApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationPendingApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
