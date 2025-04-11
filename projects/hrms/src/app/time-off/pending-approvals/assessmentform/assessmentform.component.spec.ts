import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentformComponent } from './assessmentform.component';

describe('AssessmentformComponent', () => {
  let component: AssessmentformComponent;
  let fixture: ComponentFixture<AssessmentformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
