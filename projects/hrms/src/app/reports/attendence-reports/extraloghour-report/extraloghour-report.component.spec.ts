import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraloghourReportComponent } from './extraloghour-report.component';

describe('ExtraloghourReportComponent', () => {
  let component: ExtraloghourReportComponent;
  let fixture: ComponentFixture<ExtraloghourReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraloghourReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraloghourReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
