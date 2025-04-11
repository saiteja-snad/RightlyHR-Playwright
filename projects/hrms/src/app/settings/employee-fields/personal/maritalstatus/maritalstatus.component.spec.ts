import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaritalstatusComponent } from './maritalstatus.component';

describe('MaritalstatusComponent', () => {
  let component: MaritalstatusComponent;
  let fixture: ComponentFixture<MaritalstatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaritalstatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaritalstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
