import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItsupportCompomentTabsComponent } from './itsupport-compoment-tabs.component';

describe('ItsupportCompomentTabsComponent', () => {
  let component: ItsupportCompomentTabsComponent;
  let fixture: ComponentFixture<ItsupportCompomentTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItsupportCompomentTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItsupportCompomentTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
