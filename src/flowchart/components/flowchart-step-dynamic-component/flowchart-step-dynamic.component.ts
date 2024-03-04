import { Component, Input, inject } from '@angular/core';
import { FlowchartStepComponent } from '../flowchart-step-component/flowchart-step.component';
import { FlowchartStep } from '../../types/flowchart-step.type';

/**
 * Componente base do qual devem ser herdados os componentes utilizados como steps dentro do Flowchart
 */
@Component({
  template: '',
})
export class FlowchartStepDynamicComponent<T = any> {
  /**
   * Nome do step, utilizado para associar steps salvos com as classes correspondentes
   */
  static STEP_NAME: string;
  /**
   * FlowchartStep associado à esse componente
   */
  @Input()
  protected associatedStep: FlowchartStepComponent;

  @Input() data: T;

  /**
   * Adiciona step filho
   * @param pendingComponent Step a ser adicionado
   */
  protected addChild(pendingComponent: FlowchartStep): void {
    this.associatedStep.addChild(pendingComponent);
  }
}
