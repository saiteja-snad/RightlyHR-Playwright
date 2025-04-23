import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteTabsComponent } from './remote-tabs.component';

describe('RemoteTabsComponent', () => {
  let component: RemoteTabsComponent;
  let fixture: ComponentFixture<RemoteTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
