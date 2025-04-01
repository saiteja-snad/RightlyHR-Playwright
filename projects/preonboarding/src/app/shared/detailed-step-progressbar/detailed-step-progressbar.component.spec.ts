import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedStepProgressbarComponent } from './detailed-step-progressbar.component';

describe('DetailedStepProgressbarComponent', () => {
  let component: DetailedStepProgressbarComponent;
  let fixture: ComponentFixture<DetailedStepProgressbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailedStepProgressbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailedStepProgressbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
