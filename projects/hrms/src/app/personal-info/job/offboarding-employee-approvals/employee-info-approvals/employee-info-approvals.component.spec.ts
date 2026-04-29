import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeInfoApprovalsComponent } from './employee-info-approvals.component';

describe('EmployeeInfoApprovalsComponent', () => {
  let component: EmployeeInfoApprovalsComponent;
  let fixture: ComponentFixture<EmployeeInfoApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeInfoApprovalsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeInfoApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
