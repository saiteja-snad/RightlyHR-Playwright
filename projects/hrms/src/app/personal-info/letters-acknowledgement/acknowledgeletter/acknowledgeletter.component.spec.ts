import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcknowledgeletterComponent } from './acknowledgeletter.component';

describe('AcknowledgeletterComponent', () => {
  let component: AcknowledgeletterComponent;
  let fixture: ComponentFixture<AcknowledgeletterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcknowledgeletterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcknowledgeletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
