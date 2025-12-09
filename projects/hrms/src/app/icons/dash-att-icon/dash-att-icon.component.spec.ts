import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashAttIconComponent } from './dash-att-icon.component';

describe('DashAttIconComponent', () => {
  let component: DashAttIconComponent;
  let fixture: ComponentFixture<DashAttIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashAttIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashAttIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
