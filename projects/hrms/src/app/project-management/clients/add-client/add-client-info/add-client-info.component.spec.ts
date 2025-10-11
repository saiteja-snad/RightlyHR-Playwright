import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientInfoComponent } from './add-client-info.component';

describe('AddClientInfoComponent', () => {
  let component: AddClientInfoComponent;
  let fixture: ComponentFixture<AddClientInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClientInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddClientInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
