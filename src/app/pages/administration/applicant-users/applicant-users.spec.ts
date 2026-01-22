import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantUsers } from './applicant-users';

describe('ApplicantUsers', () => {
  let component: ApplicantUsers;
  let fixture: ComponentFixture<ApplicantUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
