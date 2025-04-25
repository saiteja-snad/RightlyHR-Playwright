import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllAssetsListComponent } from './all-assets-list.component';

describe('AllAssetsListComponent', () => {
  let component: AllAssetsListComponent;
  let fixture: ComponentFixture<AllAssetsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllAssetsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllAssetsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
