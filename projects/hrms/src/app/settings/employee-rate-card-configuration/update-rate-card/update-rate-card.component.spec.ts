import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRateCardComponent } from './update-rate-card.component';

describe('UpdateRateCardComponent', () => {
  let component: UpdateRateCardComponent;
  let fixture: ComponentFixture<UpdateRateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateRateCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateRateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
