import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientResourceTabComponent } from './client-resource-tab.component';

describe('ClientResourceTabComponent', () => {
  let component: ClientResourceTabComponent;
  let fixture: ComponentFixture<ClientResourceTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientResourceTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientResourceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
