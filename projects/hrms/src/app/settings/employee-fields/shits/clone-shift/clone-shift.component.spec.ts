import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneShiftComponent } from './clone-shift.component';

describe('CloneShiftComponent', () => {
  let component: CloneShiftComponent;
  let fixture: ComponentFixture<CloneShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloneShiftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
