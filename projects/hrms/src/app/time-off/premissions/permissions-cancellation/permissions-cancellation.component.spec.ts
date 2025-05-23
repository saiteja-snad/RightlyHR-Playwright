import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsCancellationComponent } from './permissions-cancellation.component';

describe('PermissionsCancellationComponent', () => {
  let component: PermissionsCancellationComponent;
  let fixture: ComponentFixture<PermissionsCancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsCancellationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
