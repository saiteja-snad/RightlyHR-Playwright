import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDstComponent } from './update-dst.component';

describe('UpdateDstComponent', () => {
  let component: UpdateDstComponent;
  let fixture: ComponentFixture<UpdateDstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateDstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateDstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
