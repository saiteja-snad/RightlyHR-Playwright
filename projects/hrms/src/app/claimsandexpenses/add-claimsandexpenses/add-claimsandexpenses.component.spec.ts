import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClaimsandexpensesComponent } from './add-claimsandexpenses.component';

describe('AddClaimsandexpensesComponent', () => {
  let component: AddClaimsandexpensesComponent;
  let fixture: ComponentFixture<AddClaimsandexpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClaimsandexpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddClaimsandexpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
