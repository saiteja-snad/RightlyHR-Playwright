import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhReportComponent } from './wfh-report.component';

describe('WfhReportComponent', () => {
  let component: WfhReportComponent;
  let fixture: ComponentFixture<WfhReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
