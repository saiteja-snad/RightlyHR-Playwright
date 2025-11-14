import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalApprovalsComponent } from './personal-approvals.component';

describe('PersonalApprovalsComponent', () => {
  let component: PersonalApprovalsComponent;
  let fixture: ComponentFixture<PersonalApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
