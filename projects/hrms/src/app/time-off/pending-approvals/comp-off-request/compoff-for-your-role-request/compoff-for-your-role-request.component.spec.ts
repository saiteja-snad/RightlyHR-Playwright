import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompoffForYourRoleRequestComponent } from './compoff-for-your-role-request.component';

describe('CompoffForYourRoleRequestComponent', () => {
  let component: CompoffForYourRoleRequestComponent;
  let fixture: ComponentFixture<CompoffForYourRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompoffForYourRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompoffForYourRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
