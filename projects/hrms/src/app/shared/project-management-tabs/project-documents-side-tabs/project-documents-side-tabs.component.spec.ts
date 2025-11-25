import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDocumentsSideTabsComponent } from './project-documents-side-tabs.component';

describe('ProjectDocumentsSideTabsComponent', () => {
  let component: ProjectDocumentsSideTabsComponent;
  let fixture: ComponentFixture<ProjectDocumentsSideTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDocumentsSideTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDocumentsSideTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
