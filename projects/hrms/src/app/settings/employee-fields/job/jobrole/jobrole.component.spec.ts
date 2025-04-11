import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobroleComponent } from './jobrole.component';

describe('JobroleComponent', () => {
  let component: JobroleComponent;
  let fixture: ComponentFixture<JobroleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobroleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobroleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
