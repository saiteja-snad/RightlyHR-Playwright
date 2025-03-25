import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsandexpensesComponent } from './claimsandexpenses.component';

describe('ClaimsandexpensesComponent', () => {
  let component: ClaimsandexpensesComponent;
  let fixture: ComponentFixture<ClaimsandexpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsandexpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsandexpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
