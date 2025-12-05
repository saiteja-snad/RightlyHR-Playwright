import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveIconComponent } from './leave-icon.component';

describe('LeaveIconComponent', () => {
  let component: LeaveIconComponent;
  let fixture: ComponentFixture<LeaveIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
