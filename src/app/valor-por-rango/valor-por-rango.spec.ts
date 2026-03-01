import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValorPorRango } from './valor-por-rango';

describe('ValorPorRango', () => {
  let component: ValorPorRango;
  let fixture: ComponentFixture<ValorPorRango>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValorPorRango]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValorPorRango);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
