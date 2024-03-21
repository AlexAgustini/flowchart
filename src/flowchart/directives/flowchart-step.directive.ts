import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { FlowchartStep } from '../types/flowchart-step.type';
import { DragService } from '../services/flowchart-drag.service';
import { FlowchartStepsService } from '../services/flowchart-steps.service';
import { CoordinatesStorageService } from '../services/flowchart-coordinates-storage.service';
import { FlowchartRendererService } from '../services/flowchart-renderer.service';
import { FlowchartConstants } from '../helpers/flowchart-constants';

@Directive({
  selector: '[flowchartStep]',
  standalone: true,
})
export class FlowchartStepDirective {
  @Input({ required: true }) pendingStep!: FlowchartStep;

  constructor(
    private flowchartStepsService: FlowchartStepsService,
    private flowchartRendererService: FlowchartRendererService,
    private dragService: DragService
  ) {}

  @HostBinding('attr.draggable') draggable = true;

  @HostListener('dragend', ['$event']) onDragEnd(event: DragEvent) {
    event.preventDefault();
    this.dragService.clearDragData();

    if (
      this.pendingStep.canDropAnywhere &&
      this.isCursorInsideFlowchartContainer(event.x, event.y) &&
      !this.flowchartRendererService.hasPlaceholderSteps()
    ) {
      this.createStepWithFreePosition(event);
    }

    this.flowchartRendererService.flowchartElement.nativeElement.classList.remove(
      FlowchartConstants.FLOWCHART_ANIMATE_CONNECTORS_CLASS
    );
    this.dragService.onFlowchartDrop(event);
    this.flowchartRendererService.reCenterFlow();
  }

  @HostListener('dragstart', ['$event']) onDragStart(e: DragEvent) {
    this.dragService.setDragData('STEP_NAME', this.pendingStep.type);
    this.dragService.setDragData('data', this.pendingStep.data);
    this.dragService.setDragData('canDropAnywhere', this.pendingStep.canDropAnywhere);
    this.dragService.onFlowchartDragStart(e);

    this.flowchartRendererService.flowchartElement.nativeElement.classList.add(
      FlowchartConstants.FLOWCHART_ANIMATE_CONNECTORS_CLASS
    );
  }

  /**
   *
   * @param x Retorna se a posição atual do mouse está dentro do flowchart container
   */
  private isCursorInsideFlowchartContainer(x: number, y: number): boolean {
    const flowchartBoundingRect = this.flowchartRendererService.flowchartBoundingRect;

    return (
      x > flowchartBoundingRect.left &&
      x < flowchartBoundingRect.right &&
      y > flowchartBoundingRect.top &&
      y < flowchartBoundingRect.bottom
    );
  }

  /**
   *
   * @param event Cria step na em posição livre dentro do flowchart
   */
  private createStepWithFreePosition(event: DragEvent): void {
    const { x, y } = this.flowchartRendererService.getPointXYRelativeToFlowchart({
      x: event.x,
      y: event.y,
    });

    this.pendingStep.id = 's' + Date.now();

    CoordinatesStorageService.setStepCoordinates(this.pendingStep.id, { x, y });
    this.flowchartStepsService.createStep({
      pendingStep: this.pendingStep,
    });
  }
}
