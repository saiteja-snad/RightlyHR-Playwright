import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsandexpensesForYouRequestComponent } from './claimsandexpenses-for-you-request.component';

describe('ClaimsandexpensesForYouRequestComponent', () => {
  let component: ClaimsandexpensesForYouRequestComponent;
  let fixture: ComponentFixture<ClaimsandexpensesForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsandexpensesForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsandexpensesForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
