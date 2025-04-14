import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WFHEntitlemenCriteriaComponent } from './wfh-entitlemen-criteria.component';

describe('WFHEntitlemenCriteriaComponent', () => {
  let component: WFHEntitlemenCriteriaComponent;
  let fixture: ComponentFixture<WFHEntitlemenCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WFHEntitlemenCriteriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WFHEntitlemenCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
