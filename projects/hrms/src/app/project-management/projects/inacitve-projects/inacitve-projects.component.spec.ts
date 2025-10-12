import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InacitveProjectsComponent } from './inacitve-projects.component';

describe('InacitveProjectsComponent', () => {
  let component: InacitveProjectsComponent;
  let fixture: ComponentFixture<InacitveProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InacitveProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InacitveProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
