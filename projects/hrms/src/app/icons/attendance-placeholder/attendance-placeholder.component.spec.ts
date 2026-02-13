import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendancePlaceholderComponent } from './attendance-placeholder.component';

describe('AttendancePlaceholderComponent', () => {
  let component: AttendancePlaceholderComponent;
  let fixture: ComponentFixture<AttendancePlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendancePlaceholderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendancePlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
