import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedTimesheetLockComponent } from './published-timesheet-lock.component';

describe('PublishedTimesheetLockComponent', () => {
  let component: PublishedTimesheetLockComponent;
  let fixture: ComponentFixture<PublishedTimesheetLockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedTimesheetLockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedTimesheetLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
