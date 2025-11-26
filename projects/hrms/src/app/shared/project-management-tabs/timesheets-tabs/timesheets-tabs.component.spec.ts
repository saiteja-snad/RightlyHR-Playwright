import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsTabsComponent } from './timesheets-tabs.component';

describe('TimesheetsTabsComponent', () => {
  let component: TimesheetsTabsComponent;
  let fixture: ComponentFixture<TimesheetsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
