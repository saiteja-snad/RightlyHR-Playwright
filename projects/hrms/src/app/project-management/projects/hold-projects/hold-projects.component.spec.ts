import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldProjectsComponent } from './hold-projects.component';

describe('HoldProjectsComponent', () => {
  let component: HoldProjectsComponent;
  let fixture: ComponentFixture<HoldProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoldProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
