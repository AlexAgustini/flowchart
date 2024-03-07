import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { FlowchartService } from '../services/flowchart.service';
import { FlowchartStep } from '../types/flowchart-step.type';
import { DragService } from '../services/drag.service';

@Directive({
  selector: '[flowchartStep]',
  standalone: true,
})
export class FlowchartStepDirective {
  @Input({ required: true }) pendingStep!: FlowchartStep;

  constructor(
    private flowchartService: FlowchartService,
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
    e.dataTransfer.setData('STEP_NAME', this.pendingStep.STEP_NAME);
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
    const flowchartBoundingRect = this.flowchartService.flowchartBoundingRect;

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
    const { x, y } = this.flowchartService.getPointXYRelativeToFlowchart({
      x: event.x,
      y: event.y,
    });

    this.pendingStep.coordinates = {
      x,
      y,
    };

    const flowStep = this.flowchartService.createStep({
      pendingStep: this.pendingStep,
    });
  }
}
