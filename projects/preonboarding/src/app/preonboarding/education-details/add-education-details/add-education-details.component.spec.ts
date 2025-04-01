import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEducationDetailsComponent } from './add-education-details.component';

describe('AddEducationDetailsComponent', () => {
  let component: AddEducationDetailsComponent;
  let fixture: ComponentFixture<AddEducationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEducationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEducationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
