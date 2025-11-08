import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsetDashboardComponent } from './skillset-dashboard.component';

describe('SkillsetDashboardComponent', () => {
  let component: SkillsetDashboardComponent;
  let fixture: ComponentFixture<SkillsetDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsetDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsetDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
