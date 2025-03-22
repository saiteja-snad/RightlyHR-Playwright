import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionsComponent } from './premissions.component';

describe('PremissionsComponent', () => {
  let component: PremissionsComponent;
  let fixture: ComponentFixture<PremissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
