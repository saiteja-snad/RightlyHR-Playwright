import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionForYourRoleRequestComponent } from './premission-for-your-role-request.component';

describe('PremissionForYourRoleRequestComponent', () => {
  let component: PremissionForYourRoleRequestComponent;
  let fixture: ComponentFixture<PremissionForYourRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremissionForYourRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremissionForYourRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
