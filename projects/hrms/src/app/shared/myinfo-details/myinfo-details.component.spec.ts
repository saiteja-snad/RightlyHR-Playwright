import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyinfoDetailsComponent } from './myinfo-details.component';

describe('MyinfoDetailsComponent', () => {
  let component: MyinfoDetailsComponent;
  let fixture: ComponentFixture<MyinfoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyinfoDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyinfoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
