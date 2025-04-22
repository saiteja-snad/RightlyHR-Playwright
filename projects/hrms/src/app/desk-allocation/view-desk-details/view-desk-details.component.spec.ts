import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeskDetailsComponent } from './view-desk-details.component';

describe('ViewDeskDetailsComponent', () => {
  let component: ViewDeskDetailsComponent;
  let fixture: ComponentFixture<ViewDeskDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDeskDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDeskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
