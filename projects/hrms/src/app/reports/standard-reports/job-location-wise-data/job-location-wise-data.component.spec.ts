import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobLocationWiseDataComponent } from './job-location-wise-data.component';

describe('JobLocationWiseDataComponent', () => {
  let component: JobLocationWiseDataComponent;
  let fixture: ComponentFixture<JobLocationWiseDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobLocationWiseDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobLocationWiseDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
