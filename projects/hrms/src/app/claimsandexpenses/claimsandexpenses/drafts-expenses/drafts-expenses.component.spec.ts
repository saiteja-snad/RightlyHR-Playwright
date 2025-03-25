import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftsExpensesComponent } from './drafts-expenses.component';

describe('DraftsExpensesComponent', () => {
  let component: DraftsExpensesComponent;
  let fixture: ComponentFixture<DraftsExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftsExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftsExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
