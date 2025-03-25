import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsandexpensesLayoutComponent } from './claimsandexpenses-layout.component';

describe('ClaimsandexpensesLayoutComponent', () => {
  let component: ClaimsandexpensesLayoutComponent;
  let fixture: ComponentFixture<ClaimsandexpensesLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsandexpensesLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsandexpensesLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
