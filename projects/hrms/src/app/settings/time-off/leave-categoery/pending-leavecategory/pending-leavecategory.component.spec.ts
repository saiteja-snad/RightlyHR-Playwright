import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingLeavecategoryComponent } from './pending-leavecategory.component';

describe('PendingLeavecategoryComponent', () => {
  let component: PendingLeavecategoryComponent;
  let fixture: ComponentFixture<PendingLeavecategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingLeavecategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingLeavecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
