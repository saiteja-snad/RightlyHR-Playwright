import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingHolidaysComponent } from './pending-holidays.component';

describe('PendingHolidaysComponent', () => {
  let component: PendingHolidaysComponent;
  let fixture: ComponentFixture<PendingHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingHolidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
