import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedShiftsComponent } from './published-shifts.component';

describe('PublishedShiftsComponent', () => {
  let component: PublishedShiftsComponent;
  let fixture: ComponentFixture<PublishedShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedShiftsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
