import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDocumentTypesComponent } from './client-document-types.component';

describe('ClientDocumentTypesComponent', () => {
  let component: ClientDocumentTypesComponent;
  let fixture: ComponentFixture<ClientDocumentTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDocumentTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientDocumentTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
