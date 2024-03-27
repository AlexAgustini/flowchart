import { FlowchartStepsEnum } from '../enums/flowchart-steps.enum';
import { FlowchartComponent } from '../flowchart.component';
import { Injectable } from '@angular/core';
import { FlowchartStepCoordinates } from '../types/flowchart-step.type';
import { FlowchartRendererService } from './flowchart-renderer.service';
import { FlowchartConstants } from '../helpers/flowchart-constants';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
@Injectable({
  providedIn: 'root',
})
export class FlowchartDragService {
  constructor(private flowchartRendererService: FlowchartRendererService) {}

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
   * Coordenadas de um droparea sobre o qual pode ocorrer um evento de drag
   */
  public dropareaCoordinates: FlowchartStepCoordinates;

  /**
   * Seta key no {@link dragData}
   * @param key Chave
   * @param value Valor
   */
  public setDragData(key: 'STEP_TYPE' | 'data' | 'canDropAnywhere' | 'canDropInBetweenSteps', value: any): void {
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
  public getDragData(key: 'STEP_TYPE' | 'data' | 'canDropAnywhere' | 'canDropInBetweenSteps'): any {
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
    this.flowchartRendererService.isDragging = true;
    this.stepsOnDragStart = Array.from(
      this.flowchartRendererService.steps.map((step) => {
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
    this.flowchartRendererService.isDragging = false;
    this.stepsOnDragStart = null;

    if (this.flowchartRendererService.hasPlaceholderSteps()) {
      this.flowchartRendererService.getAllPlaceholderSteps().forEach((step) => (step.isPlaceholder = false));
      this.flowchartRendererService.reCenterFlow();
    }
  }

  /**
   * Observa drag abaixo de steps para criação de steps placeholder
   * @param event
   */
  private observeDragBelowStep(event: DragEvent): void {
    const isBelowStep = this.stepsOnDragStart?.find((step) => {
      if (step.type != FlowchartStepsEnum.STEP_RESULT && step.type != FlowchartStepsEnum.STEP_INITIAL) return;
      return (
        event.offsetX > step.dimensions.x - FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_WIDTH_THRESHOLD &&
        event.offsetX <
          step.dimensions.x +
            step.dimensions.width +
            FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_WIDTH_THRESHOLD &&
        step.dimensions.y + step.dimensions.height < event.offsetY &&
        step.dimensions.y +
          step.dimensions.height +
          FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_HEIGHT_THRESHOLD >
          event.offsetY
      );
    });

    if (isBelowStep) {
      // Caso esteja ná area de drop de um step, mas já tenha placeholder renderizados, retorna
      if (this.flowchartRendererService.hasPlaceholderSteps()) return;

      const parentStep = this.flowchartRendererService.getStepById(isBelowStep.id);

      this.createDropPlaceholder(parentStep);
    } else {
      // Se estiver ocorrendo drag encima de um droparea, retorna
      if (this.isDraggingOverDroparea(event.clientX, event.clientY)) return;

      // Se estiver em delay de criação de placeholders, retorna (para evitar bugs visuais)
      if (this.isOnPlaceholderCreationDelay) return;

      // Se não houverem placeholder steps, retorna
      if (!this.flowchartRendererService.hasPlaceholderSteps()) return;

      this.removeDropPlaceholders();
    }
  }

  /**
   * Cria flowchartStep placeholder no fluxo
   * @param connector
   * @returns
   */
  public createDropPlaceholder(parentStep: FlowchartStepComponent) {
    if (this.isOnPlaceholderCreationDelay) return;
    this.isOnPlaceholderCreationDelay = true;
    setTimeout(
      () => (this.isOnPlaceholderCreationDelay = false),
      FlowchartConstants.FLOWCHART_MIN_PLACEHOLDER_CREATION_DELAY
    );

    if (
      !this.getDragData('canDropInBetweenSteps') &&
      parentStep.children[0].type !== FlowchartStepsEnum.STEP_DROPAREA
    ) {
      return;
    }

    const stepType = this.getDragData('STEP_TYPE');

    parentStep.children.forEach((child) => child.storeDragCoordinatesBeforeBeingAffectedByPlaceholder());
    parentStep.addChild({
      pendingComponent: {
        type: stepType,
      },
      asSibling: false,
      asPlaceholder: true,
    });
  }

  /**
   * Remove placeholders criados
   */
  private removeDropPlaceholders(): void {
    this.flowchartRendererService.getAllPlaceholderSteps().forEach((step) => step.removeSelf());
  }

  /**
   * Retorna se está ocorrendo um evento de drag encima das coordenadas de um droparea
   * @param clientX Coordenadas do mouse eixo X
   * @param clientY Coordenadas do mouse eixo Y
   */
  private isDraggingOverDroparea(clientX: number, clientY: number): boolean {
    if (!this.dropareaCoordinates) return false;

    const { x: mouseX, y: mouseY } = this.flowchartRendererService.getPointXYRelativeToFlowchart({
      x: clientX,
      y: clientY,
    });

    const dropareaLeftMargin = this.dropareaCoordinates.x;
    const dropareaRightMargin = this.dropareaCoordinates.x + this.dropareaCoordinates.width;
    const dropareaTopMargin = this.dropareaCoordinates.y;
    const dropareaBottomMargin = this.dropareaCoordinates.y + this.dropareaCoordinates.height + 16; // padding;

    return (
      mouseX > dropareaLeftMargin &&
      mouseX < dropareaRightMargin &&
      mouseY > dropareaTopMargin &&
      mouseY < dropareaBottomMargin
    );
  }
}
