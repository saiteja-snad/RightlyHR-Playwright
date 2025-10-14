import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTimeSheetsComponent } from './client-time-sheets.component';

describe('ClientTimeSheetsComponent', () => {
  let component: ClientTimeSheetsComponent;
  let fixture: ComponentFixture<ClientTimeSheetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTimeSheetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTimeSheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
