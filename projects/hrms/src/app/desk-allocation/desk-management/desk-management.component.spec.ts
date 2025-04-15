import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskManagementComponent } from './desk-management.component';

describe('DeskManagementComponent', () => {
  let component: DeskManagementComponent;
  let fixture: ComponentFixture<DeskManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeskManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeskManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
