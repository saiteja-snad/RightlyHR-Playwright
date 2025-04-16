import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttandaceReportTabsComponent } from './attandace-report-tabs.component';

describe('AttandaceReportTabsComponent', () => {
  let component: AttandaceReportTabsComponent;
  let fixture: ComponentFixture<AttandaceReportTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttandaceReportTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttandaceReportTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
