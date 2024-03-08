import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { FlowchartStep } from '../types/flowchart-step.type';
import { DragService } from '../services/drag.service';
import { FlowchartCanvasService } from '../services/flowchart-canvas.service';
import { FlowchartStepsService } from '../services/flowchart-steps.service';
import { CoordinatesStorageService } from '../services/coordinates-storage.service';

@Directive({
  selector: '[flowchartStep]',
  standalone: true,
})
export class FlowchartStepDirective {
  @Input({ required: true }) pendingStep!: FlowchartStep;

  constructor(
    private flowchartCanvasService: FlowchartCanvasService,
    private flowchartStepsService: FlowchartStepsService,
    private dragService: DragService
  ) {}

  @HostBinding('attr.draggable') draggable = true;

  @HostListener('dragend', ['$event']) onDragEnd(event: DragEvent) {
    event.preventDefault();

    if (
      this.pendingStep.canDropAnywhere &&
      !this.dragService.isHoveringOverDropArea &&
      this.isCursorInsideFlowchartContainer(event.x, event.y)
    ) {
      this.createStepWithFreePosition(event);
    }
  }

  @HostListener('dragstart', ['$event']) onDragStart(e: DragEvent) {
    e.dataTransfer.setData('STEP_NAME', this.pendingStep.type);
    e.dataTransfer.setData('data', JSON.stringify(this.pendingStep.data));
    e.dataTransfer.setData(
      'canDropAnywhere',
      String(this.pendingStep.canDropAnywhere)
    );
  }

  /**
   *
   * @param x Retorna se a posição atual do mouse está dentro do flowchart container
   */
  private isCursorInsideFlowchartContainer(x: number, y: number): boolean {
    const flowchartBoundingRect =
      this.flowchartCanvasService.flowchartBoundingRect;

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
    const { x, y } = this.flowchartCanvasService.getPointXYRelativeToFlowchart({
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
