import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTabsReportsComponent } from './monthly-tabs-reports.component';

describe('MonthlyTabsReportsComponent', () => {
  let component: MonthlyTabsReportsComponent;
  let fixture: ComponentFixture<MonthlyTabsReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyTabsReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyTabsReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
