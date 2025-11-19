import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeinfoForYourRoleRequestComponent } from './employeeinfo-for-your-role-request.component';

describe('EmployeeinfoForYourRoleRequestComponent', () => {
  let component: EmployeeinfoForYourRoleRequestComponent;
  let fixture: ComponentFixture<EmployeeinfoForYourRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeinfoForYourRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeinfoForYourRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
