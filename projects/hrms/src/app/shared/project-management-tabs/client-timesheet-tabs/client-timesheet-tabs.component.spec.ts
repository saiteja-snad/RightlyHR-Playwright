import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTimesheetTabsComponent } from './client-timesheet-tabs.component';

describe('ClientTimesheetTabsComponent', () => {
  let component: ClientTimesheetTabsComponent;
  let fixture: ComponentFixture<ClientTimesheetTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTimesheetTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTimesheetTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
