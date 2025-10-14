import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientContactInformationComponent } from './client-contact-information.component';

describe('ClientContactInformationComponent', () => {
  let component: ClientContactInformationComponent;
  let fixture: ComponentFixture<ClientContactInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientContactInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientContactInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
