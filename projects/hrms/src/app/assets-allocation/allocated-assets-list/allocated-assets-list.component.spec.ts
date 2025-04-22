import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocatedAssetsListComponent } from './allocated-assets-list.component';

describe('AllocatedAssetsListComponent', () => {
  let component: AllocatedAssetsListComponent;
  let fixture: ComponentFixture<AllocatedAssetsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocatedAssetsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllocatedAssetsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
