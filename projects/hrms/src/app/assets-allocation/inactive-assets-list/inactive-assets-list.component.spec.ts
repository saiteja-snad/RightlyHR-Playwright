import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveAssetsListComponent } from './inactive-assets-list.component';

describe('InactiveAssetsListComponent', () => {
  let component: InactiveAssetsListComponent;
  let fixture: ComponentFixture<InactiveAssetsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveAssetsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveAssetsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
