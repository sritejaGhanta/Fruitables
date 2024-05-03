import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RattingComponentComponent } from './ratting-component.component';

describe('RattingComponentComponent', () => {
  let component: RattingComponentComponent;
  let fixture: ComponentFixture<RattingComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RattingComponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RattingComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
