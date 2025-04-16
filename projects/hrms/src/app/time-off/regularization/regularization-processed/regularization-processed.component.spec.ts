import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationProcessedComponent } from './regularization-processed.component';

describe('RegularizationProcessedComponent', () => {
  let component: RegularizationProcessedComponent;
  let fixture: ComponentFixture<RegularizationProcessedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationProcessedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationProcessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
