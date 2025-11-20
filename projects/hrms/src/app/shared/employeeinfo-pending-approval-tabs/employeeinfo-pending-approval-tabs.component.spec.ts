import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeinfoPendingApprovalTabsComponent } from './employeeinfo-pending-approval-tabs.component';

describe('EmployeeinfoPendingApprovalTabsComponent', () => {
  let component: EmployeeinfoPendingApprovalTabsComponent;
  let fixture: ComponentFixture<EmployeeinfoPendingApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeinfoPendingApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeinfoPendingApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
