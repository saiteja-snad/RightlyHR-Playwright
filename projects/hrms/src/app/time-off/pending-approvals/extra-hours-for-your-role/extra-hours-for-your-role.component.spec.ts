import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursForYourRoleComponent } from './extra-hours-for-your-role.component';

describe('ExtraHoursForYourRoleComponent', () => {
  let component: ExtraHoursForYourRoleComponent;
  let fixture: ComponentFixture<ExtraHoursForYourRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursForYourRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursForYourRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
