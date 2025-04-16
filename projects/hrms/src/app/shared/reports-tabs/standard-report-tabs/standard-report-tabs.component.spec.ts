import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardReportTabsComponent } from './standard-report-tabs.component';

describe('StandardReportTabsComponent', () => {
  let component: StandardReportTabsComponent;
  let fixture: ComponentFixture<StandardReportTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandardReportTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandardReportTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
