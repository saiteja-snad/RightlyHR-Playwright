import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompensationReasonComponent } from './compensation-reason.component';

describe('CompensationReasonComponent', () => {
  let component: CompensationReasonComponent;
  let fixture: ComponentFixture<CompensationReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompensationReasonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompensationReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
