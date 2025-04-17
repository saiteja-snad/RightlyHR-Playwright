import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDstComponent } from './view-dst.component';

describe('ViewDstComponent', () => {
  let component: ViewDstComponent;
  let fixture: ComponentFixture<ViewDstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
