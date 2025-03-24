import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOffTabsComponent } from './time-off-tabs.component';

describe('TimeOffTabsComponent', () => {
  let component: TimeOffTabsComponent;
  let fixture: ComponentFixture<TimeOffTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeOffTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeOffTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
