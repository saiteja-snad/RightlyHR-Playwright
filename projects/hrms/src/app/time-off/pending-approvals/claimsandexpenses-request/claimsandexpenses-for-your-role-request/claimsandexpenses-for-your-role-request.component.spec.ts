import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsandexpensesForYourRoleRequestComponent } from './claimsandexpenses-for-your-role-request.component';

describe('ClaimsandexpensesForYourRoleRequestComponent', () => {
  let component: ClaimsandexpensesForYourRoleRequestComponent;
  let fixture: ComponentFixture<ClaimsandexpensesForYourRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsandexpensesForYourRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsandexpensesForYourRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
