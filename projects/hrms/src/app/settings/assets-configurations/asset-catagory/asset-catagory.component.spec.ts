import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCatagoryComponent } from './asset-catagory.component';

describe('AssetCatagoryComponent', () => {
  let component: AssetCatagoryComponent;
  let fixture: ComponentFixture<AssetCatagoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetCatagoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetCatagoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
