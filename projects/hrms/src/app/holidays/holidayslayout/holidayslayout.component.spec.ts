import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayslayoutComponent } from './holidayslayout.component';

describe('HolidayslayoutComponent', () => {
  let component: HolidayslayoutComponent;
  let fixture: ComponentFixture<HolidayslayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidayslayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidayslayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
