import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateShiftsComponent } from './update-shifts.component';

describe('UpdateShiftsComponent', () => {
  let component: UpdateShiftsComponent;
  let fixture: ComponentFixture<UpdateShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateShiftsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
