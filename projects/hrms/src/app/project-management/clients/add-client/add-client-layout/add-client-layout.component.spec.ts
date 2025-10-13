import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientLayoutComponent } from './add-client-layout.component';

describe('AddClientLayoutComponent', () => {
  let component: AddClientLayoutComponent;
  let fixture: ComponentFixture<AddClientLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClientLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddClientLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
