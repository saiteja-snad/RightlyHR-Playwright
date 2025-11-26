import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDocumentTypesComponent } from './project-document-types.component';

describe('ProjectDocumentTypesComponent', () => {
  let component: ProjectDocumentTypesComponent;
  let fixture: ComponentFixture<ProjectDocumentTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDocumentTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDocumentTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
