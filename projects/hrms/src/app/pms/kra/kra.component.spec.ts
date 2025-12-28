import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KraComponent } from './kra.component';

describe('KraComponent', () => {
  let component: KraComponent;
  let fixture: ComponentFixture<KraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
