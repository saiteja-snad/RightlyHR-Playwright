import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProspectiveInternComponent } from './add-prospective-intern.component';

describe('AddProspectiveInternComponent', () => {
  let component: AddProspectiveInternComponent;
  let fixture: ComponentFixture<AddProspectiveInternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProspectiveInternComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProspectiveInternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
