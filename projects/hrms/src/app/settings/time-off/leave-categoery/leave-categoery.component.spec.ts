import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveCategoeryComponent } from './leave-categoery.component';

describe('LeaveCategoeryComponent', () => {
  let component: LeaveCategoeryComponent;
  let fixture: ComponentFixture<LeaveCategoeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveCategoeryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveCategoeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
