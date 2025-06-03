import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeManagementTabsComponent } from './employee-management-tabs.component';

describe('EmployeeManagementTabsComponent', () => {
  let component: EmployeeManagementTabsComponent;
  let fixture: ComponentFixture<EmployeeManagementTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeManagementTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeManagementTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
