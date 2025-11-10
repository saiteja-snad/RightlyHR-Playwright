import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceViewSummaryComponent } from './resource-view-summary.component';

describe('ResourceViewSummaryComponent', () => {
  let component: ResourceViewSummaryComponent;
  let fixture: ComponentFixture<ResourceViewSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceViewSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceViewSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
