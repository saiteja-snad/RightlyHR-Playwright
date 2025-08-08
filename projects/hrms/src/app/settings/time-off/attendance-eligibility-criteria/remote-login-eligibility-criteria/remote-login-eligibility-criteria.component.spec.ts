import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteLoginEligibilityCriteriaComponent } from './remote-login-eligibility-criteria.component';

describe('RemoteLoginEligibilityCriteriaComponent', () => {
  let component: RemoteLoginEligibilityCriteriaComponent;
  let fixture: ComponentFixture<RemoteLoginEligibilityCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteLoginEligibilityCriteriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteLoginEligibilityCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
