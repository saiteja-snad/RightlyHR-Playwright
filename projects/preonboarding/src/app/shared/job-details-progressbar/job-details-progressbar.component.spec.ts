import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsProgressbarComponent } from './job-details-progressbar.component';

describe('JobDetailsProgressbarComponent', () => {
  let component: JobDetailsProgressbarComponent;
  let fixture: ComponentFixture<JobDetailsProgressbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDetailsProgressbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobDetailsProgressbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
