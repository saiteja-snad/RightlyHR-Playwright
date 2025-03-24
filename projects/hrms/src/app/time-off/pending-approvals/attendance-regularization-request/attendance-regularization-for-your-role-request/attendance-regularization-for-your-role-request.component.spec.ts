import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRegularizationForYourRoleRequestComponent } from './attendance-regularization-for-your-role-request.component';

describe('AttendanceRegularizationForYourRoleRequestComponent', () => {
  let component: AttendanceRegularizationForYourRoleRequestComponent;
  let fixture: ComponentFixture<AttendanceRegularizationForYourRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceRegularizationForYourRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceRegularizationForYourRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
