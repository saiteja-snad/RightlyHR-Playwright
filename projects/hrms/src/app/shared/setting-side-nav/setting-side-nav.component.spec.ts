import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingSideNavComponent } from './setting-side-nav.component';

describe('SettingSideNavComponent', () => {
  let component: SettingSideNavComponent;
  let fixture: ComponentFixture<SettingSideNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingSideNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
