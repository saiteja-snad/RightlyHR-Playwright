import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KraConfigurationComponent } from './kra-configuration.component';

describe('KraConfigurationComponent', () => {
  let component: KraConfigurationComponent;
  let fixture: ComponentFixture<KraConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KraConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KraConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
