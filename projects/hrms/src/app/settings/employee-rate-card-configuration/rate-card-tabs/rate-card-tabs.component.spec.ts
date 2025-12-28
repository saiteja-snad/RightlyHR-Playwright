import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateCardTabsComponent } from './rate-card-tabs.component';

describe('RateCardTabsComponent', () => {
  let component: RateCardTabsComponent;
  let fixture: ComponentFixture<RateCardTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateCardTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateCardTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
