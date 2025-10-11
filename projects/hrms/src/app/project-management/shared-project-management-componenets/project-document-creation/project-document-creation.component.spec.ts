import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDocumentCreationComponent } from './project-document-creation.component';

describe('ProjectDocumentCreationComponent', () => {
  let component: ProjectDocumentCreationComponent;
  let fixture: ComponentFixture<ProjectDocumentCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDocumentCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDocumentCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
