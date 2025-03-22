import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffRejectComponent } from './comp-off-reject.component';

describe('CompOffRejectComponent', () => {
  let component: CompOffRejectComponent;
  let fixture: ComponentFixture<CompOffRejectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffRejectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffRejectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
