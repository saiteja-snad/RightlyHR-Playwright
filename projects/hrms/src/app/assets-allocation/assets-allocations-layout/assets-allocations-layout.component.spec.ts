import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsAllocationsLayoutComponent } from './assets-allocations-layout.component';

describe('AssetsAllocationsLayoutComponent', () => {
  let component: AssetsAllocationsLayoutComponent;
  let fixture: ComponentFixture<AssetsAllocationsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetsAllocationsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetsAllocationsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
