import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobNameComponent } from './job-name.component';

describe('JobNameComponent', () => {
  let component: JobNameComponent;
  let fixture: ComponentFixture<JobNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobNameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
