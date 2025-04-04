import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEducationDetailsComponent } from './update-education-details.component';

describe('UpdateEducationDetailsComponent', () => {
  let component: UpdateEducationDetailsComponent;
  let fixture: ComponentFixture<UpdateEducationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateEducationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateEducationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
