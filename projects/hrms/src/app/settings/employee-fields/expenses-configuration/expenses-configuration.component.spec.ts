import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesConfigurationComponent } from './expenses-configuration.component';

describe('ExpensesConfigurationComponent', () => {
  let component: ExpensesConfigurationComponent;
  let fixture: ComponentFixture<ExpensesConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
