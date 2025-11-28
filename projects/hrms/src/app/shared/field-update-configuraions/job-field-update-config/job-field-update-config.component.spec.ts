import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFieldUpdateConfigComponent } from './job-field-update-config.component';

describe('JobFieldUpdateConfigComponent', () => {
  let component: JobFieldUpdateConfigComponent;
  let fixture: ComponentFixture<JobFieldUpdateConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobFieldUpdateConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobFieldUpdateConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
