import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalenderLayOutComponent } from './calender-lay-out.component';

describe('CalenderLayOutComponent', () => {
  let component: CalenderLayOutComponent;
  let fixture: ComponentFixture<CalenderLayOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalenderLayOutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalenderLayOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
