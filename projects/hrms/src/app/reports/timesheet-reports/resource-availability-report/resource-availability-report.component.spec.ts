import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceAvailabilityReportComponent } from './resource-availability-report.component';

describe('ResourceAvailabilityReportComponent', () => {
  let component: ResourceAvailabilityReportComponent;
  let fixture: ComponentFixture<ResourceAvailabilityReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceAvailabilityReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceAvailabilityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
