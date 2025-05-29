import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeManagementLayoutComponent } from './employee-management-layout.component';

describe('EmployeeManagementLayoutComponent', () => {
  let component: EmployeeManagementLayoutComponent;
  let fixture: ComponentFixture<EmployeeManagementLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeManagementLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeManagementLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
