import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyinfoLayoutComponent } from './myinfo-layout.component';

describe('MyinfoLayoutComponent', () => {
  let component: MyinfoLayoutComponent;
  let fixture: ComponentFixture<MyinfoLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyinfoLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyinfoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
