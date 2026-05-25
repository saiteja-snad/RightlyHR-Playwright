import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeHelpDeskComponent } from './employee-help-desk.component';

describe('EmployeeHelpDeskComponent', () => {
  let component: EmployeeHelpDeskComponent;
  let fixture: ComponentFixture<EmployeeHelpDeskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeHelpDeskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeHelpDeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
