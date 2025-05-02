import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingShiftsComponent } from './pending-shifts.component';

describe('PendingShiftsComponent', () => {
  let component: PendingShiftsComponent;
  let fixture: ComponentFixture<PendingShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingShiftsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
