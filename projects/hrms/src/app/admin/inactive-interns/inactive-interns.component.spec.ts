import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveInternsComponent } from './inactive-interns.component';

describe('InactiveInternsComponent', () => {
  let component: InactiveInternsComponent;
  let fixture: ComponentFixture<InactiveInternsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveInternsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveInternsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
