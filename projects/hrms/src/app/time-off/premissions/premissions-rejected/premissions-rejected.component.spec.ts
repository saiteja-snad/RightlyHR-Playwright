import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionsRejectedComponent } from './premissions-rejected.component';

describe('PremissionsRejectedComponent', () => {
  let component: PremissionsRejectedComponent;
  let fixture: ComponentFixture<PremissionsRejectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremissionsRejectedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremissionsRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
