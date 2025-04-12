import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOffLayoutComponent } from './time-off-layout.component';

describe('TimeOffLayoutComponent', () => {
  let component: TimeOffLayoutComponent;
  let fixture: ComponentFixture<TimeOffLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeOffLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeOffLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
