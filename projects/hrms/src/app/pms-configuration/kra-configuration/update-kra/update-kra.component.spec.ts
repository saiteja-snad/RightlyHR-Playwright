import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateKraComponent } from './update-kra.component';

describe('UpdateKraComponent', () => {
  let component: UpdateKraComponent;
  let fixture: ComponentFixture<UpdateKraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateKraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateKraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
