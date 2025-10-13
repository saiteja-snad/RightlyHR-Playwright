import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalenderIconComponent } from './calender-icon.component';

describe('CalenderIconComponent', () => {
  let component: CalenderIconComponent;
  let fixture: ComponentFixture<CalenderIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalenderIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalenderIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
