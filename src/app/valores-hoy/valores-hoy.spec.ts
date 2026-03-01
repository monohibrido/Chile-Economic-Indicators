import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValoresHoy } from './valores-hoy';

describe('ValoresHoy', () => {
  let component: ValoresHoy;
  let fixture: ComponentFixture<ValoresHoy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValoresHoy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValoresHoy);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
