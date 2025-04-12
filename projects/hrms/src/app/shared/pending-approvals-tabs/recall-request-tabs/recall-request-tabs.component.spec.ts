import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecallRequestTabsComponent } from './recall-request-tabs.component';

describe('RecallRequestTabsComponent', () => {
  let component: RecallRequestTabsComponent;
  let fixture: ComponentFixture<RecallRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecallRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecallRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
