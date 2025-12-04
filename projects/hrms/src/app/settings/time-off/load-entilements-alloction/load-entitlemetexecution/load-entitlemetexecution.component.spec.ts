import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadEntitlemetexecutionComponent } from './load-entitlemetexecution.component';

describe('LoadEntitlemetexecutionComponent', () => {
  let component: LoadEntitlemetexecutionComponent;
  let fixture: ComponentFixture<LoadEntitlemetexecutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadEntitlemetexecutionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadEntitlemetexecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
