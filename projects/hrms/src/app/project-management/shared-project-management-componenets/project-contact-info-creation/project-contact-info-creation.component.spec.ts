import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectContactInfoCreationComponent } from './project-contact-info-creation.component';

describe('ProjectContactInfoCreationComponent', () => {
  let component: ProjectContactInfoCreationComponent;
  let fixture: ComponentFixture<ProjectContactInfoCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectContactInfoCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectContactInfoCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
