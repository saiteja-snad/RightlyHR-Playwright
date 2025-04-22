import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveFormsComponent } from './inactive-forms.component';

describe('InactiveFormsComponent', () => {
  let component: InactiveFormsComponent;
  let fixture: ComponentFixture<InactiveFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
