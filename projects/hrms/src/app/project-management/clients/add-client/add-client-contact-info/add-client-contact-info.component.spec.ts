import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientContactInfoComponent } from './add-client-contact-info.component';

describe('AddClientContactInfoComponent', () => {
  let component: AddClientContactInfoComponent;
  let fixture: ComponentFixture<AddClientContactInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClientContactInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddClientContactInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
