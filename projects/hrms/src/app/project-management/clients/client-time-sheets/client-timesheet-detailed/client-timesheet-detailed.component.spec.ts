import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTimesheetDetailedComponent } from './client-timesheet-detailed.component';

describe('ClientTimesheetDetailedComponent', () => {
  let component: ClientTimesheetDetailedComponent;
  let fixture: ComponentFixture<ClientTimesheetDetailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTimesheetDetailedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTimesheetDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
