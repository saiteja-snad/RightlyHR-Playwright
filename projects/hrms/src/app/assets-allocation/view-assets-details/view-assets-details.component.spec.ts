import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssetsDetailsComponent } from './view-assets-details.component';

describe('ViewAssetsDetailsComponent', () => {
  let component: ViewAssetsDetailsComponent;
  let fixture: ComponentFixture<ViewAssetsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAssetsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAssetsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
