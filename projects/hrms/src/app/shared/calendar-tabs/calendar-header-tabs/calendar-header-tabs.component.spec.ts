import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarHeaderTabsComponent } from './calendar-header-tabs.component';

describe('CalendarHeaderTabsComponent', () => {
  let component: CalendarHeaderTabsComponent;
  let fixture: ComponentFixture<CalendarHeaderTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarHeaderTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarHeaderTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
