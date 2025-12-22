import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneRateCardComponent } from './clone-rate-card.component';

describe('CloneRateCardComponent', () => {
  let component: CloneRateCardComponent;
  let fixture: ComponentFixture<CloneRateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloneRateCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneRateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
