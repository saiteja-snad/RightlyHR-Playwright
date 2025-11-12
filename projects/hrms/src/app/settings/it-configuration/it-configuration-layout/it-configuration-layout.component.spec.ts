import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItConfigurationLayoutComponent } from './it-configuration-layout.component';

describe('ItConfigurationLayoutComponent', () => {
  let component: ItConfigurationLayoutComponent;
  let fixture: ComponentFixture<ItConfigurationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItConfigurationLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItConfigurationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
