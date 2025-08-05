import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationIconComponent } from './confirmation-icon.component';

describe('ConfirmationIconComponent', () => {
  let component: ConfirmationIconComponent;
  let fixture: ComponentFixture<ConfirmationIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
