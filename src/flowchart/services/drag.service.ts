import { FlowchartStepsEnum } from './../helpers/flowchart-steps.enum';
import { FlowchartComponent } from './../flowchart.component';
import { Injectable } from '@angular/core';
import { FlowchartStepCoordinates } from '../types/flowchart-step.type';
import { FlowchartService } from './flowchart.service';
import { FlowchartConstants } from '../helpers/flowchart-constants';
@Injectable({
  providedIn: 'root',
})
export class DragService {
  constructor(private flowchartService: FlowchartService) {}

  /**
   * Map de dados transferidos no dragEvent do {@link FlowchartComponent}
   */
  private dragData: Map<string, any> = new Map();

  /**
   * Flag que controla tempo mínimo de delay entre criação de placeholders
   */
  private isOnPlaceholderCreationDelay: boolean;

  public stepsOnDragStart: Array<{
    id: string;
    type: FlowchartStepsEnum;
    dimensions: FlowchartStepCoordinates;
  }>;

  /**
   * Seta key no {@link dragData}
   * @param key Chave
   * @param value Valor
   */
  public setDragData(key: string, value: any): void {
    this.dragData.set(key, value);
  }

  /**
   * Limpa {@link dragData}
   */
  public clearDragData(): void {
    this.dragData.clear();
  }

  /**
   *
   * @param key Busca chave no {@link dragData}
   */
  public getDragData(key: string): any {
    return this.dragData.get(key);
  }

  /**
   * Remove chave no {@link dragData}
   * @param key Chave a ser removida
   */
  public removeDragData(key: string): void {
    this.dragData.delete(key);
  }

  /**
   * Observa eventos de dragover sobre o {@link FlowchartComponent}
   * @param e Evento de drag
   */
  public onFlowchartDragStart(event: DragEvent): void {
    this.flowchartService.isDragging = true;
    this.stepsOnDragStart = Array.from(
      this.flowchartService.steps.map((step) => {
        return {
          id: step.id,
          type: step.type,
          dimensions: step.getCoordinates(),
        };
      })
    );
  }

  /**
   * Observa eventos de dragover sobre o {@link FlowchartComponent}
   * @param e Evento de drag
   */
  public onFlowchartDragOver(event: DragEvent): void {
    this.observeDragBelowStep(event);
  }

  /**
   * Observa eventos de drop sobre o {@link FlowchartComponent}
   * @param e Evento de drag
   */
  public onFlowchartDrop(e: DragEvent): void {
    this.stepsOnDragStart = null;
    this.flowchartService.isDragging = false;
    if (this.flowchartService.hasPlaceholderSteps()) {
      this.flowchartService
        .getAllPlaceholderSteps()
        .forEach((step) => (step.isPlaceholder = false));
    }
  }

  /**
   * Observa drag abaixo de steps para criação de steps placeholder
   * @param event
   */
  private observeDragBelowStep(event: DragEvent): void {
    const isBelowStep = this.stepsOnDragStart.find((step) => {
      if (step.type == FlowchartStepsEnum.STEP_RESULT) return;
      return (
        event.offsetX >
          step.dimensions.x -
            FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_THRESHOLD &&
        event.offsetX <
          step.dimensions.x +
            step.dimensions.width +
            FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_THRESHOLD &&
        step.dimensions.y + step.dimensions.height < event.offsetY &&
        step.dimensions.y +
          step.dimensions.height +
          FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_THRESHOLD * 4 >
          event.offsetY
      );
    });

    if (isBelowStep) {
      // Caso esteja ná area de drop de um step, mas esteja em delay ou já tenha placeholder renderizados, retorna
      if (
        this.isOnPlaceholderCreationDelay ||
        this.flowchartService.hasPlaceholderSteps()
      )
        return;

      this.createDropPlaceholder(isBelowStep);
      this.isOnPlaceholderCreationDelay = true;

      setTimeout(() => {
        this.isOnPlaceholderCreationDelay = false;
      }, FlowchartConstants.FLOWCHART_MIN_PLACEHOLDER_CREATION_DELAY);
    } else {
      // Caso não esteja na área de drop de nenhum step, e tenha placeholders sendo exibidos, exclui estes placeholder
      if (this.flowchartService.hasPlaceholderSteps()) {
        this.removeDropPlaceholder();
      }
    }
  }

  /**
   * Cria flowchartStep placeholder no fluxo
   * @param connector
   * @returns
   */
  public createDropPlaceholder(parent: {
    id: string;
    dimensions: FlowchartStepCoordinates;
  }) {
    const stepName = this.getDragData('STEP_NAME');
    const parentStep = this.flowchartService.getStepById(parent.id);

    parentStep.children.forEach((child) =>
      child.storeDragCoordinatesBeforeBeingAffectedByPlaceholder()
    );

    const placeholderStep = {
      pendingComponent: {
        type: stepName,
      },
      asSibling: false,
      asPlaceholder: true,
    };

    parentStep.addChild(placeholderStep);
  }

  /**
   * Remove placeholder
   */
  private removeDropPlaceholder() {
    this.flowchartService
      .getAllPlaceholderSteps()
      .forEach((step) => step.removeSelf());
  }
}
