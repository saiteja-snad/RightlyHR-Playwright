import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillSetMainTabsComponent } from './skill-set-main-tabs.component';

describe('SkillSetMainTabsComponent', () => {
  let component: SkillSetMainTabsComponent;
  let fixture: ComponentFixture<SkillSetMainTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillSetMainTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillSetMainTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
