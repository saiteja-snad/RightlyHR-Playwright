import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkExportComponent } from './bulk-export.component';

describe('BulkExportComponent', () => {
  let component: BulkExportComponent;
  let fixture: ComponentFixture<BulkExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkExportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
