import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsetManagementLayoutComponent } from './skillset-management-layout.component';

describe('SkillsetManagementLayoutComponent', () => {
  let component: SkillsetManagementLayoutComponent;
  let fixture: ComponentFixture<SkillsetManagementLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsetManagementLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsetManagementLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
