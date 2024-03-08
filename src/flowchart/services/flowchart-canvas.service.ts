import { ElementRef, Injectable, ViewContainerRef } from '@angular/core';
import { Point } from '@angular/cdk/drag-drop';
import { FlowchartStepsService } from './flowchart-steps.service';
import { FlowchartStep } from '../types/flowchart-step.type';

@Injectable({
  providedIn: 'root',
})
export class FlowchartCanvasService {
  /**
   * ViewContainer do {@link FlowchartComponent}
   */
  public flowchartViewContainer!: ViewContainerRef;
  /**
   * ElementRef do {@link FlowchartComponent}
   */
  private flowchartElement!: ElementRef<HTMLElement>;

  constructor(private flowchartStepsService: FlowchartStepsService) {}

  /**
   *Inicia construção do chart por um bloco inicial
   * @param initialStep Bloco inicial
   */
  public initFlowchart(initialStep: FlowchartStep) {
    if (!this.flowchartViewContainer) throw Error('Need to register first');

    this.flowchartStepsService.createStep({
      pendingStep: initialStep,
    });
  }

  public registerFlowchart(
    flowchartViewContainer: ViewContainerRef,
    flowchartElement: ElementRef<HTMLElement>
  ) {
    this.flowchartViewContainer = flowchartViewContainer;
    this.flowchartElement = flowchartElement;

    this.flowchartStepsService.registerFlowchartContainer(
      flowchartViewContainer
    );
  }

  /**
   * Calcula coordenadas coordenadas de um ponto XY relativos à tela e os retorna relativos ao elemento do flowchart
   * @param point Ponto a ser calculado
   */
  public getPointXYRelativeToFlowchart(point: Point): Point {
    return {
      x: point.x - this.flowchartBoundingRect.x,
      y: point.y - this.flowchartBoundingRect.y,
    };
  }

  /**
   * Retorna elemento nativo do flowchart
   */
  public get flowchartEl() {
    return this.flowchartElement.nativeElement;
  }

  /**
   * Retorna dimensões do flowchart
   */
  public get flowchartBoundingRect() {
    return this.flowchartEl.getBoundingClientRect();
  }
}
