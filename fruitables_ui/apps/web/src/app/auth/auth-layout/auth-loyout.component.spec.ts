import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthLoyoutComponent } from './auth-loyout.component';

describe('AuthLoyoutComponent', () => {
  let component: AuthLoyoutComponent;
  let fixture: ComponentFixture<AuthLoyoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLoyoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLoyoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
