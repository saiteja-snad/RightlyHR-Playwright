import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparationForYourRoleRequestComponent } from './separation-for-your-role-request.component';

describe('SeparationForYourRoleRequestComponent', () => {
  let component: SeparationForYourRoleRequestComponent;
  let fixture: ComponentFixture<SeparationForYourRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeparationForYourRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeparationForYourRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
