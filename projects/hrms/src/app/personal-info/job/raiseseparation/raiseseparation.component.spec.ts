import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseseparationComponent } from './raiseseparation.component';

describe('RaiseseparationComponent', () => {
  let component: RaiseseparationComponent;
  let fixture: ComponentFixture<RaiseseparationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaiseseparationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaiseseparationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
