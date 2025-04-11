import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServingPeriodComponent } from './serving-period.component';

describe('ServingPeriodComponent', () => {
  let component: ServingPeriodComponent;
  let fixture: ComponentFixture<ServingPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServingPeriodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServingPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
