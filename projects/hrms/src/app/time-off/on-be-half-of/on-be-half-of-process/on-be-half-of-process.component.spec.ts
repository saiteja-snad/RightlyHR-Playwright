import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBeHalfOfProcessComponent } from './on-be-half-of-process.component';

describe('OnBeHalfOfProcessComponent', () => {
  let component: OnBeHalfOfProcessComponent;
  let fixture: ComponentFixture<OnBeHalfOfProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBeHalfOfProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBeHalfOfProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
