import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationForYourRoleRequestComponent } from './regularization-for-your-role-request.component';

describe('RegularizationForYourRoleRequestComponent', () => {
  let component: RegularizationForYourRoleRequestComponent;
  let fixture: ComponentFixture<RegularizationForYourRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationForYourRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationForYourRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
