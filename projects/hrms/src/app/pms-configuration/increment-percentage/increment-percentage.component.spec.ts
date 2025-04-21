import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncrementPercentageComponent } from './increment-percentage.component';

describe('IncrementPercentageComponent', () => {
  let component: IncrementPercentageComponent;
  let fixture: ComponentFixture<IncrementPercentageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncrementPercentageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncrementPercentageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
