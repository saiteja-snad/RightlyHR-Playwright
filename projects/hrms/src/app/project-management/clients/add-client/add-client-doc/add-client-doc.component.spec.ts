import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientDocComponent } from './add-client-doc.component';

describe('AddClientDocComponent', () => {
  let component: AddClientDocComponent;
  let fixture: ComponentFixture<AddClientDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClientDocComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddClientDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
