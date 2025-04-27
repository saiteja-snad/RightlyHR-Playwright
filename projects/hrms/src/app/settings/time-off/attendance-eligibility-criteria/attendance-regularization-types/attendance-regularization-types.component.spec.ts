import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRegularizationTypesComponent } from './attendance-regularization-types.component';

describe('AttendanceRegularizationTypesComponent', () => {
  let component: AttendanceRegularizationTypesComponent;
  let fixture: ComponentFixture<AttendanceRegularizationTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceRegularizationTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceRegularizationTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
