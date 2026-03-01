import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValorPorFecha } from './valor-por-fecha';

describe('ValorPorFecha', () => {
  let component: ValorPorFecha;
  let fixture: ComponentFixture<ValorPorFecha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValorPorFecha],
    }).compileComponents();

    fixture = TestBed.createComponent(ValorPorFecha);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
