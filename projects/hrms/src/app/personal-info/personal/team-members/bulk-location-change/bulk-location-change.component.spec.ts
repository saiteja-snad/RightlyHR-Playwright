import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkLocationChangeComponent } from './bulk-location-change.component';

describe('BulkLocationChangeComponent', () => {
  let component: BulkLocationChangeComponent;
  let fixture: ComponentFixture<BulkLocationChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkLocationChangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkLocationChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
