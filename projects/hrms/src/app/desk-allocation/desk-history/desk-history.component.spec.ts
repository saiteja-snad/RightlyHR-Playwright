import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskHistoryComponent } from './desk-history.component';

describe('DeskHistoryComponent', () => {
  let component: DeskHistoryComponent;
  let fixture: ComponentFixture<DeskHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeskHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeskHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
