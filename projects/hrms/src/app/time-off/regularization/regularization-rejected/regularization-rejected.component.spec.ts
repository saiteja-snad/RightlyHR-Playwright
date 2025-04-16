import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationRejectedComponent } from './regularization-rejected.component';

describe('RegularizationRejectedComponent', () => {
  let component: RegularizationRejectedComponent;
  let fixture: ComponentFixture<RegularizationRejectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationRejectedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
