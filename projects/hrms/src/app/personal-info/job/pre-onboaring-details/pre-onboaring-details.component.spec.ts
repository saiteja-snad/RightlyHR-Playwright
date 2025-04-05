import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreOnboaringDetailsComponent } from './pre-onboaring-details.component';

describe('PreOnboaringDetailsComponent', () => {
  let component: PreOnboaringDetailsComponent;
  let fixture: ComponentFixture<PreOnboaringDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreOnboaringDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreOnboaringDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
