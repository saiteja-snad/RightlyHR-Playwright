import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRegularizationRequestTabsComponent } from './attendance-regularization-request-tabs.component';

describe('AttendanceRegularizationRequestTabsComponent', () => {
  let component: AttendanceRegularizationRequestTabsComponent;
  let fixture: ComponentFixture<AttendanceRegularizationRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceRegularizationRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceRegularizationRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
