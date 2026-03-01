import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoIndicador } from './grafico-indicador';

describe('GraficoIndicador', () => {
  let component: GraficoIndicador;
  let fixture: ComponentFixture<GraficoIndicador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoIndicador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoIndicador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
