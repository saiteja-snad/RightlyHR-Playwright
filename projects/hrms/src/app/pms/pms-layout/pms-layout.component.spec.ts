import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmsLayoutComponent } from './pms-layout.component';

describe('PmsLayoutComponent', () => {
  let component: PmsLayoutComponent;
  let fixture: ComponentFixture<PmsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PmsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
