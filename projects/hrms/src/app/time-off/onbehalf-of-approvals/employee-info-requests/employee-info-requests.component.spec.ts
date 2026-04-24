import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInfoRequestsComponent } from './employee-info-requests.component';

describe('EmployeeInfoRequestsComponent', () => {
  let component: EmployeeInfoRequestsComponent;
  let fixture: ComponentFixture<EmployeeInfoRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeInfoRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeInfoRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
