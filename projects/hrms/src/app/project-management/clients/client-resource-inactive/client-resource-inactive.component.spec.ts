import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientResourceInactiveComponent } from './client-resource-inactive.component';

describe('ClientResourceInactiveComponent', () => {
  let component: ClientResourceInactiveComponent;
  let fixture: ComponentFixture<ClientResourceInactiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientResourceInactiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientResourceInactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
