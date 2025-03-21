import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProspectiveEmployeeComponent } from './add-prospective-employee.component';

describe('AddProspectiveEmployeeComponent', () => {
  let component: AddProspectiveEmployeeComponent;
  let fixture: ComponentFixture<AddProspectiveEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProspectiveEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProspectiveEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
