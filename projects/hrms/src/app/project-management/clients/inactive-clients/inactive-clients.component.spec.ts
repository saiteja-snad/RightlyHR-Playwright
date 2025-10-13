import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveClientsComponent } from './inactive-clients.component';

describe('InactiveClientsComponent', () => {
  let component: InactiveClientsComponent;
  let fixture: ComponentFixture<InactiveClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
