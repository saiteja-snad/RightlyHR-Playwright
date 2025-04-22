import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolvedTicketsComponent } from './solved-tickets.component';

describe('SolvedTicketsComponent', () => {
  let component: SolvedTicketsComponent;
  let fixture: ComponentFixture<SolvedTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolvedTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolvedTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
