import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompoffReportComponent } from './compoff-report.component';

describe('CompoffReportComponent', () => {
  let component: CompoffReportComponent;
  let fixture: ComponentFixture<CompoffReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompoffReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompoffReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
