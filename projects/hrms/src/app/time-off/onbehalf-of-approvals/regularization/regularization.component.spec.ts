import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationComponent } from './regularization.component';

describe('RegularizationComponent', () => {
  let component: RegularizationComponent;
  let fixture: ComponentFixture<RegularizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
