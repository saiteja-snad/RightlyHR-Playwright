import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpDeskReportTabsComponent } from './help-desk-report-tabs.component';

describe('HelpDeskReportTabsComponent', () => {
  let component: HelpDeskReportTabsComponent;
  let fixture: ComponentFixture<HelpDeskReportTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpDeskReportTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpDeskReportTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
