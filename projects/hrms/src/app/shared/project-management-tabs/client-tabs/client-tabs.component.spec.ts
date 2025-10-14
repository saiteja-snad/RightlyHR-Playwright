import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTabsComponent } from './client-tabs.component';

describe('ClientTabsComponent', () => {
  let component: ClientTabsComponent;
  let fixture: ComponentFixture<ClientTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
