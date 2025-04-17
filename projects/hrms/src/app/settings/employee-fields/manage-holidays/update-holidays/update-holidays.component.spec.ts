import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateHolidaysComponent } from './update-holidays.component';

describe('UpdateHolidaysComponent', () => {
  let component: UpdateHolidaysComponent;
  let fixture: ComponentFixture<UpdateHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateHolidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
