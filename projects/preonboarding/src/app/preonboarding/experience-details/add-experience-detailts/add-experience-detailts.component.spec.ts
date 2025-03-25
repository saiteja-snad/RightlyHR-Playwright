import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExperienceDetailtsComponent } from './add-experience-detailts.component';

describe('AddExperienceDetailtsComponent', () => {
  let component: AddExperienceDetailtsComponent;
  let fixture: ComponentFixture<AddExperienceDetailtsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddExperienceDetailtsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddExperienceDetailtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
