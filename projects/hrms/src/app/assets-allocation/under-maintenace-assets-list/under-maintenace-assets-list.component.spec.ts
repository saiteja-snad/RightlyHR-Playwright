import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderMaintenaceAssetsListComponent } from './under-maintenace-assets-list.component';

describe('UnderMaintenaceAssetsListComponent', () => {
  let component: UnderMaintenaceAssetsListComponent;
  let fixture: ComponentFixture<UnderMaintenaceAssetsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderMaintenaceAssetsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderMaintenaceAssetsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
