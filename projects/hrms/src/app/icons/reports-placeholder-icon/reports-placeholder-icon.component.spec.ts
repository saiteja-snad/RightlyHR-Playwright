import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsPlaceholderIconComponent } from './reports-placeholder-icon.component';

describe('ReportsPlaceholderIconComponent', () => {
  let component: ReportsPlaceholderIconComponent;
  let fixture: ComponentFixture<ReportsPlaceholderIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsPlaceholderIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsPlaceholderIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
