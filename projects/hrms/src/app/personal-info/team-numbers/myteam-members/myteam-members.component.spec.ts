import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyteamMembersComponent } from './myteam-members.component';

describe('MyteamMembersComponent', () => {
  let component: MyteamMembersComponent;
  let fixture: ComponentFixture<MyteamMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyteamMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyteamMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
