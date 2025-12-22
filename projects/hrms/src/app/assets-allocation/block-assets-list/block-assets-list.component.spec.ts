import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockAssetsListComponent } from './block-assets-list.component';

describe('BlockAssetsListComponent', () => {
  let component: BlockAssetsListComponent;
  let fixture: ComponentFixture<BlockAssetsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockAssetsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockAssetsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
