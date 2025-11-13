import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsResourceTabsComponent } from './timesheets-resource-tabs.component';

describe('TimesheetsResourceTabsComponent', () => {
  let component: TimesheetsResourceTabsComponent;
  let fixture: ComponentFixture<TimesheetsResourceTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetsResourceTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetsResourceTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
