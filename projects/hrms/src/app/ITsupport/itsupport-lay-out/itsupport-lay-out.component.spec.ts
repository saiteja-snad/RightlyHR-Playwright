import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItsupportLayOutComponent } from './itsupport-lay-out.component';

describe('ItsupportLayOutComponent', () => {
  let component: ItsupportLayOutComponent;
  let fixture: ComponentFixture<ItsupportLayOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItsupportLayOutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItsupportLayOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
