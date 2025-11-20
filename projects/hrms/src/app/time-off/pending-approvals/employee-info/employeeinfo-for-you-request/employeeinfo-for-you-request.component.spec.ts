import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeinfoForYouRequestComponent } from './employeeinfo-for-you-request.component';

describe('EmployeeinfoForYouRequestComponent', () => {
  let component: EmployeeinfoForYouRequestComponent;
  let fixture: ComponentFixture<EmployeeinfoForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeinfoForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeinfoForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
