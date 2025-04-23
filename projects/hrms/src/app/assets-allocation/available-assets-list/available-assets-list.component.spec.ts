import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableAssetsListComponent } from './available-assets-list.component';

describe('AvailableAssetsListComponent', () => {
  let component: AvailableAssetsListComponent;
  let fixture: ComponentFixture<AvailableAssetsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableAssetsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableAssetsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
