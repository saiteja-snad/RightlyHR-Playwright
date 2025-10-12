import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectContactsComponent } from './project-contacts.component';

describe('ProjectContactsComponent', () => {
  let component: ProjectContactsComponent;
  let fixture: ComponentFixture<ProjectContactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectContactsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
