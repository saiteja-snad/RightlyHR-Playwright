import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetConfigurationLayOutComponent } from './asset-configuration-lay-out.component';

describe('AssetConfigurationLayOutComponent', () => {
  let component: AssetConfigurationLayOutComponent;
  let fixture: ComponentFixture<AssetConfigurationLayOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetConfigurationLayOutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetConfigurationLayOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
