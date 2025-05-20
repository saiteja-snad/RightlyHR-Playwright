import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidaysLayoutComponent } from './holidays-layout.component';

describe('HolidaysLayoutComponent', () => {
  let component: HolidaysLayoutComponent;
  let fixture: ComponentFixture<HolidaysLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidaysLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidaysLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
