import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsTabsComponent } from './events-tabs.component';

describe('EventsTabsComponent', () => {
  let component: EventsTabsComponent;
  let fixture: ComponentFixture<EventsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
