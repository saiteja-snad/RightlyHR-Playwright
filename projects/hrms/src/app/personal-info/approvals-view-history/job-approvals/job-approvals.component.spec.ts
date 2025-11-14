import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobApprovalsComponent } from './job-approvals.component';

describe('JobApprovalsComponent', () => {
  let component: JobApprovalsComponent;
  let fixture: ComponentFixture<JobApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
