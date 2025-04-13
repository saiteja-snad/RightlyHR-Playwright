import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHolidaysComponent } from './add-holidays.component';

describe('AddHolidaysComponent', () => {
  let component: AddHolidaysComponent;
  let fixture: ComponentFixture<AddHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddHolidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
