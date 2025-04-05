import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateExperienceDetailsComponent } from './update-experience-details.component';

describe('UpdateExperienceDetailsComponent', () => {
  let component: UpdateExperienceDetailsComponent;
  let fixture: ComponentFixture<UpdateExperienceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateExperienceDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateExperienceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
