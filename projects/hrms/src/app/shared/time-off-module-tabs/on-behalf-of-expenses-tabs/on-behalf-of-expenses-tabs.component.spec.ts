import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfExpensesTabsComponent } from './on-behalf-of-expenses-tabs.component';

describe('OnBehalfOfExpensesTabsComponent', () => {
  let component: OnBehalfOfExpensesTabsComponent;
  let fixture: ComponentFixture<OnBehalfOfExpensesTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfExpensesTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfExpensesTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
