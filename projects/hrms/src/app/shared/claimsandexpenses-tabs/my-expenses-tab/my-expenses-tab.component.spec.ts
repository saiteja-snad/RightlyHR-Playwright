import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyExpensesTabComponent } from './my-expenses-tab.component';

describe('MyExpensesTabComponent', () => {
  let component: MyExpensesTabComponent;
  let fixture: ComponentFixture<MyExpensesTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyExpensesTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyExpensesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
