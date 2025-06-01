import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesAndResponsibilitiesComponent } from './roles-and-responsibilities.component';

describe('RolesAndResponsibilitiesComponent', () => {
  let component: RolesAndResponsibilitiesComponent;
  let fixture: ComponentFixture<RolesAndResponsibilitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesAndResponsibilitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesAndResponsibilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
