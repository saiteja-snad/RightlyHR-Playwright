import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOffRequestTabsComponent } from './time-off-request-tabs.component';

describe('TimeOffRequestTabsComponent', () => {
  let component: TimeOffRequestTabsComponent;
  let fixture: ComponentFixture<TimeOffRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeOffRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeOffRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
