import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodueFormDetailsComponent } from './nodue-form-details.component';

describe('NodueFormDetailsComponent', () => {
  let component: NodueFormDetailsComponent;
  let fixture: ComponentFixture<NodueFormDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodueFormDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodueFormDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
