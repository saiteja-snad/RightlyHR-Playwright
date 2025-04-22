import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskForYourRoleRequestComponent } from './desk-for-your-role-request.component';

describe('DeskForYourRoleRequestComponent', () => {
  let component: DeskForYourRoleRequestComponent;
  let fixture: ComponentFixture<DeskForYourRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeskForYourRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeskForYourRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
