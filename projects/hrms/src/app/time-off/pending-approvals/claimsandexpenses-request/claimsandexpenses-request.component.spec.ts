import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsandexpensesRequestComponent } from './claimsandexpenses-request.component';

describe('ClaimsandexpensesRequestComponent', () => {
  let component: ClaimsandexpensesRequestComponent;
  let fixture: ComponentFixture<ClaimsandexpensesRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsandexpensesRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsandexpensesRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
