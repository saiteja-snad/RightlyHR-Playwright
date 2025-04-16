import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDstComponent } from './add-dst.component';

describe('AddDstComponent', () => {
  let component: AddDstComponent;
  let fixture: ComponentFixture<AddDstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
