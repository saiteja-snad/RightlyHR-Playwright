import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOffForYourRoleRequestComponent } from './time-off-for-your-role-request.component';

describe('TimeOffForYourRoleRequestComponent', () => {
  let component: TimeOffForYourRoleRequestComponent;
  let fixture: ComponentFixture<TimeOffForYourRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeOffForYourRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeOffForYourRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
