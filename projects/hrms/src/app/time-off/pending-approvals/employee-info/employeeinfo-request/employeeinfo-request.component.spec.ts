import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeinfoRequestComponent } from './employeeinfo-request.component';

describe('EmployeeinfoRequestComponent', () => {
  let component: EmployeeinfoRequestComponent;
  let fixture: ComponentFixture<EmployeeinfoRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeinfoRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeinfoRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
