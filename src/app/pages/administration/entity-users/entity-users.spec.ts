import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityUsers } from './entity-users';

describe('EntityUsers', () => {
  let component: EntityUsers;
  let fixture: ComponentFixture<EntityUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
