import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShiftComponent } from './view-shift.component';

describe('ViewShiftComponent', () => {
  let component: ViewShiftComponent;
  let fixture: ComponentFixture<ViewShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewShiftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
