import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailesComponent } from './project-detailes.component';

describe('ProjectDetailesComponent', () => {
  let component: ProjectDetailesComponent;
  let fixture: ComponentFixture<ProjectDetailesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
