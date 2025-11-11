import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSideTabsComponent } from './client-side-tabs.component';

describe('ClientSideTabsComponent', () => {
  let component: ClientSideTabsComponent;
  let fixture: ComponentFixture<ClientSideTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSideTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientSideTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
