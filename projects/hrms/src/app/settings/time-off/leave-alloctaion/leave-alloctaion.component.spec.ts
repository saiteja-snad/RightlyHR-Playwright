import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveAlloctaionComponent } from './leave-alloctaion.component';

describe('LeaveAlloctaionComponent', () => {
  let component: LeaveAlloctaionComponent;
  let fixture: ComponentFixture<LeaveAlloctaionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveAlloctaionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveAlloctaionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
