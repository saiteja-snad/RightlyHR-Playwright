import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBeHalfOfRejectComponent } from './on-be-half-of-reject.component';

describe('OnBeHalfOfRejectComponent', () => {
  let component: OnBeHalfOfRejectComponent;
  let fixture: ComponentFixture<OnBeHalfOfRejectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBeHalfOfRejectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBeHalfOfRejectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
