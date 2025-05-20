import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBeHalfOfCancelComponent } from './on-be-half-of-cancel.component';

describe('OnBeHalfOfCancelComponent', () => {
  let component: OnBeHalfOfCancelComponent;
  let fixture: ComponentFixture<OnBeHalfOfCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBeHalfOfCancelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBeHalfOfCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
