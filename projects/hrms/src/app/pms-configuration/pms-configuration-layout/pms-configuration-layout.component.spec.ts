import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmsConfigurationLayoutComponent } from './pms-configuration-layout.component';

describe('PmsConfigurationLayoutComponent', () => {
  let component: PmsConfigurationLayoutComponent;
  let fixture: ComponentFixture<PmsConfigurationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmsConfigurationLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PmsConfigurationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
