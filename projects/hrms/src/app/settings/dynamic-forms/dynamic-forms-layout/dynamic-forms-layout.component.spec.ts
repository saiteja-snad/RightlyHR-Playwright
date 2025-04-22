import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormsLayoutComponent } from './dynamic-forms-layout.component';

describe('DynamicFormsLayoutComponent', () => {
  let component: DynamicFormsLayoutComponent;
  let fixture: ComponentFixture<DynamicFormsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicFormsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
