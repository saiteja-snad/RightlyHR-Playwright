import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalExpensesConfigurationComponent } from './global-expenses-configuration.component';

describe('GlobalExpensesConfigurationComponent', () => {
  let component: GlobalExpensesConfigurationComponent;
  let fixture: ComponentFixture<GlobalExpensesConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalExpensesConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalExpensesConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
