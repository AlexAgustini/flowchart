import { ElementRef, Injectable, ViewContainerRef } from '@angular/core';
import { FlowchartStepsService } from './flowchart-steps.service';
import { FlowchartRendererService } from './flowchart-renderer.service';
import { FlowchartStep } from '../types/flowchart-step.type';
import { FlowchartConnectorsService } from './flowchart-connectors.service';

@Injectable({
  providedIn: 'root',
})
export class FlowchartService {
  /**
   * Serviço de steps
   */
  private readonly flowchartStepsService: FlowchartStepsService;
  /**
   * Serviço renderer do flow
   */
  private readonly flowchartRendererService: FlowchartRendererService;
  /**
   * Serviço de conectores
   */
  private readonly connectorsService: FlowchartConnectorsService;

  constructor(
    flowchartStepsService: FlowchartStepsService,
    flowchartRendererService: FlowchartRendererService,
    connectorsService: FlowchartConnectorsService
  ) {
    this.flowchartStepsService = flowchartStepsService;
    this.flowchartRendererService = flowchartRendererService;
    this.connectorsService = connectorsService;
  }

  /**
   * Inicia o flowchart
   * @param initialStep Step inicial
   */
  public initSteps(initialStep: FlowchartStep): void {
    this.flowchartStepsService.createStep({ pendingStep: initialStep });
  }

  /**
   * Registra flowchart
   * @param flowchartViewContainer Container do flowchart
   * @param flowchartElement Elemento do flowchart
   * @param svgCanvas Svg utilizado para renderizar conectores
   */
  public initFlowchart(
    flowchartViewContainer: ViewContainerRef,
    flowchartElement: ElementRef<HTMLDivElement>,
    svgCanvas: ElementRef<SVGElement>
  ): void {
    this.connectorsService.registerSvg(svgCanvas.nativeElement);
    this.flowchartRendererService.registerFlowchart(flowchartViewContainer, flowchartElement, svgCanvas);
    this.flowchartStepsService.registerFlowchart(flowchartViewContainer, flowchartElement);
  }
}
