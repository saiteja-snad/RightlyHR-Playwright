import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BussinesareaComponent } from './bussinesarea.component';

describe('BussinesareaComponent', () => {
  let component: BussinesareaComponent;
  let fixture: ComponentFixture<BussinesareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BussinesareaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BussinesareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
