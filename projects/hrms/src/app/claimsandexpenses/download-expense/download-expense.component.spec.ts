import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadExpenseComponent } from './download-expense.component';

describe('DownloadExpenseComponent', () => {
  let component: DownloadExpenseComponent;
  let fixture: ComponentFixture<DownloadExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadExpenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
