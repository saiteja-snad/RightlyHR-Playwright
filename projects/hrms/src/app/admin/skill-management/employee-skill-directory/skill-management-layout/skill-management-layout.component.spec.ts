import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillManagementLayoutComponent } from './skill-management-layout.component';

describe('SkillManagementLayoutComponent', () => {
  let component: SkillManagementLayoutComponent;
  let fixture: ComponentFixture<SkillManagementLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillManagementLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillManagementLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
