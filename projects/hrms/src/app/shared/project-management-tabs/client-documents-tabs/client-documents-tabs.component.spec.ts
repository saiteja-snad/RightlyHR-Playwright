import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDocumentsTabsComponent } from './client-documents-tabs.component';

describe('ClientDocumentsTabsComponent', () => {
  let component: ClientDocumentsTabsComponent;
  let fixture: ComponentFixture<ClientDocumentsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDocumentsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientDocumentsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
