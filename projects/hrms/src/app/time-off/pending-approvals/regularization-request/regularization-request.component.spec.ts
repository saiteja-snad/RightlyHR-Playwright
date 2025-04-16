import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationRequestComponent } from './regularization-request.component';

describe('RegularizationRequestComponent', () => {
  let component: RegularizationRequestComponent;
  let fixture: ComponentFixture<RegularizationRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
