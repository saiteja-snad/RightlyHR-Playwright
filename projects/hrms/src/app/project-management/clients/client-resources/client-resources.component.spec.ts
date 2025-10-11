import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientResourcesComponent } from './client-resources.component';

describe('ClientResourcesComponent', () => {
  let component: ClientResourcesComponent;
  let fixture: ComponentFixture<ClientResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientResourcesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
