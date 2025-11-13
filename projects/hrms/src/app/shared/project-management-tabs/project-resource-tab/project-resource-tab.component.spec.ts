import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectResourceTabComponent } from './project-resource-tab.component';

describe('ProjectResourceTabComponent', () => {
  let component: ProjectResourceTabComponent;
  let fixture: ComponentFixture<ProjectResourceTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectResourceTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectResourceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
