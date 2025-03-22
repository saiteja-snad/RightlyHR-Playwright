import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBeHalfOfComponent } from './on-be-half-of.component';

describe('OnBeHalfOfComponent', () => {
  let component: OnBeHalfOfComponent;
  let fixture: ComponentFixture<OnBeHalfOfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBeHalfOfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBeHalfOfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
