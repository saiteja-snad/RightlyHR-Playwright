import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDstComponent } from './manage-dst.component';

describe('ManageDstComponent', () => {
  let component: ManageDstComponent;
  let fixture: ComponentFixture<ManageDstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
