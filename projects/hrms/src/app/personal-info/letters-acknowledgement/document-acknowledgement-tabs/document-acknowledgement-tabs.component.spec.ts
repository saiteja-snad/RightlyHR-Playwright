import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAcknowledgementTabsComponent } from './document-acknowledgement-tabs.component';

describe('DocumentAcknowledgementTabsComponent', () => {
  let component: DocumentAcknowledgementTabsComponent;
  let fixture: ComponentFixture<DocumentAcknowledgementTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentAcknowledgementTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentAcknowledgementTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
