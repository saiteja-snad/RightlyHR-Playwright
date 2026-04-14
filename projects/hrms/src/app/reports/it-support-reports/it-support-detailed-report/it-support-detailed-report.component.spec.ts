import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItSupportDetailedReportComponent } from './it-support-detailed-report.component';

describe('ItSupportDetailedReportComponent', () => {
  let component: ItSupportDetailedReportComponent;
  let fixture: ComponentFixture<ItSupportDetailedReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItSupportDetailedReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItSupportDetailedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
