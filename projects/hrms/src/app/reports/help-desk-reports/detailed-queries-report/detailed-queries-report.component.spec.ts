import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedQueriesReportComponent } from './detailed-queries-report.component';

describe('DetailedQueriesReportComponent', () => {
  let component: DetailedQueriesReportComponent;
  let fixture: ComponentFixture<DetailedQueriesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailedQueriesReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailedQueriesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
