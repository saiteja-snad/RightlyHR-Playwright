import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillDirectoryManagementComponent } from './skill-directory-management.component';

describe('SkillDirectoryManagementComponent', () => {
  let component: SkillDirectoryManagementComponent;
  let fixture: ComponentFixture<SkillDirectoryManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillDirectoryManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillDirectoryManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
