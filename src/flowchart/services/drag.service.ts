import { FlowchartComponent } from './../flowchart.component';
import { Injectable } from '@angular/core';
import {
  FlowchartStep,
  FlowchartStepConnector,
} from '../types/flowchart-step.type';
import { FlowchartService } from './flowchart.service';
import { FlowchartConstants } from '../helpers/flowchart-constants.enum';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { FlowchartStepsService } from './flowchart-steps.service';
import { FlowBlocksEnum } from '../helpers/flowchart-steps-registry';

@Injectable({
  providedIn: 'root',
})
export class DragService {
  constructor(
    private flowchartService: FlowchartService,
    private flowchartStepsService: FlowchartStepsService
  ) {}

  /**
   * Map de dados transferidos no dragEvent do {@link FlowchartComponent}
   */
  private dragData: Map<string, any> = new Map();
  /**
   * Referência ao componente placeholder atual sendo exibido
   */
  private currentPlaceholder: FlowchartStepComponent;
  /**
   * Referência ao pai do componente placeholder atual sendo exibido
   */
  private currentPlaceholderParent: FlowchartStepComponent;
  private connectorsOnDragStart: Array<{
    connector: FlowchartStepConnector;
    dimensions: DOMRect;
  }>;

  /**
   * Flag que controla se está ocorrendo drag encima de uma droparea ou de um path, utilizado para steps que podem ser dropados
   * em qualquer lugar, para não criar mais de um step
   */
  private _isDraggingOverDropAreaOrPath: boolean;

  /**
   * {@link _isDraggingOverDropAreaOrPath}
   */
  public get isDraggingOverDropAreaOrPath(): boolean {
    return this._isDraggingOverDropAreaOrPath;
  }
  /**
   * {@link _isDraggingOverDropAreaOrPath}
   */
  public set isDraggingOverDropAreaOrPath(value: boolean) {
    this._isDraggingOverDropAreaOrPath = value;
  }

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
  public onFlowchartDragStart(e: DragEvent): void {
    this.connectorsOnDragStart = Array.from(
      this.flowchartService.connectors.map((connector) => {
        return {
          connector: connector,
          dimensions: connector.path.getBoundingClientRect(),
        };
      })
    );
  }

  /**
   * Observa eventos de dragover sobre o {@link FlowchartComponent}
   * @param e Evento de drag
   */
  public onFlowchartDragEnd(e: DragEvent): void {
    this.connectorsOnDragStart = null;
  }

  /**
   * Observa eventos de dragover sobre o {@link FlowchartComponent}
   * @param e Evento de drag
   */
  public onFlowchartDragOver(e: DragEvent): void {
    this.observeDragOverConnectors(e);
  }

  /**
   * Observa eventos de drop sobre o {@link FlowchartComponent}
   * @param e Evento de drag
   */
  public onFlowchartDrop(e: DragEvent): void {
    this.currentPlaceholder?.toggleTreeOpacity();

    if (this.currentPlaceholder) {
      this.currentPlaceholder.elementRef.nativeElement.classList.remove(
        'placeholder'
      );
    }

    this.currentPlaceholder = null;
    this.currentPlaceholderParent = null;
  }

  /**
   * Observa eventos de dragover sobre o {@link FlowchartComponent} e cria placeholder de componentes ao ocorrer um drag perto de um path
   * @param e Evento de drag
   */
  private observeDragOverConnectors(e: DragEvent): void {
    const nearestConnector = this.connectorsOnDragStart.find((connector) => {
      const connectorDimensions = connector.dimensions;

      const { x: connectorX, y: connectorY } =
        this.flowchartService.getPointXYRelativeToFlowchart({
          x: connectorDimensions.x,
          y: connectorDimensions.y,
        });

      return (
        e.offsetX >
          connectorX -
            FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_THRESHOLD &&
        e.offsetX <
          connectorX +
            connectorDimensions.width +
            FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_THRESHOLD &&
        e.offsetY >
          connectorY -
            FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_THRESHOLD &&
        e.offsetY <
          connectorY +
            connectorDimensions.height +
            FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_THRESHOLD
      );
    });

    if (nearestConnector) {
      this.isDraggingOverDropAreaOrPath = true;
      this.createDropPlaceholder(nearestConnector.connector);
    } else {
      this.isDraggingOverDropAreaOrPath = false;
      if (this.currentPlaceholder) {
        this.currentPlaceholderParent.toggleTreeOpacity();
        this.removeDropPlaceholder();
      }
    }
  }

  /**
   * Cria flowchartStep placeholder no fluxo
   * @param connector
   * @returns
   */
  public createDropPlaceholder(connector: FlowchartStepConnector) {
    if (this.currentPlaceholder) return;

    this.currentPlaceholderParent = this.flowchartService.getStepById(
      connector.parentId
    );

    this.currentPlaceholderParent?.toggleTreeOpacity();
    const stepName = this.getDragData('STEP_NAME');

    this.currentPlaceholder = this.currentPlaceholderParent?.addChild(
      {
        type: stepName,
      },
      false
    );

    // Adiciona classe de placeholder para manipulação de comportamento de eventos de drag com pointer-events
    this.currentPlaceholder?.elementRef.nativeElement.classList.add(
      'placeholder'
    );
  }

  /**
   * Remove placeholder
   */
  private removeDropPlaceholder() {
    this.currentPlaceholder.removeSelf();
    this.currentPlaceholder = null;
  }
}
