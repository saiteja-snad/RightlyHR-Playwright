import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionsApprovedComponent } from './premissions-approved.component';

describe('PremissionsApprovedComponent', () => {
  let component: PremissionsApprovedComponent;
  let fixture: ComponentFixture<PremissionsApprovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremissionsApprovedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremissionsApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
