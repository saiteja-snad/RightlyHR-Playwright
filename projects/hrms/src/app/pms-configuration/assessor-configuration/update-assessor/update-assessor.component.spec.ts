import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAssessorComponent } from './update-assessor.component';

describe('UpdateAssessorComponent', () => {
  let component: UpdateAssessorComponent;
  let fixture: ComponentFixture<UpdateAssessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAssessorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateAssessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
