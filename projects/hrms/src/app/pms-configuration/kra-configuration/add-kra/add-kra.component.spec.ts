import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKraComponent } from './add-kra.component';

describe('AddKraComponent', () => {
  let component: AddKraComponent;
  let fixture: ComponentFixture<AddKraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddKraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddKraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
