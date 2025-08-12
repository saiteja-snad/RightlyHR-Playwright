import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgChartGridComponent } from './org-chart-grid.component';

describe('OrgChartGridComponent', () => {
  let component: OrgChartGridComponent;
  let fixture: ComponentFixture<OrgChartGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgChartGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgChartGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
