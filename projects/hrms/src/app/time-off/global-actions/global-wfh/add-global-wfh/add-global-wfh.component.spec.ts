import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGlobalWfhComponent } from './add-global-wfh.component';

describe('AddGlobalWfhComponent', () => {
  let component: AddGlobalWfhComponent;
  let fixture: ComponentFixture<AddGlobalWfhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGlobalWfhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGlobalWfhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
