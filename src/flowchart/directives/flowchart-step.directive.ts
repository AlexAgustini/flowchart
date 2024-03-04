import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { FlowchartRendererService } from '../services/flowchart.service';
import { FlowchartStep } from '../types/flowchart-step.type';

@Directive({
  selector: '[flowchartStep]',
  standalone: true,
})
export class FlowchartStepDirective {
  @Input({ required: true }) pendingStep!: FlowchartStep;

  constructor(private flowchartRendererService: FlowchartRendererService) {}

  @HostBinding('attr.draggable') draggable = true;

  @HostListener('dragend', ['$event']) onDragEnd(event: DragEvent) {
    event.preventDefault();
    if (this.pendingStep.canDropAnywhere) {
      const flowStep = this.flowchartRendererService.createStep({
        ...this.pendingStep,
      });

      flowStep.setCoordinates(
        this.flowchartRendererService.getPointXYRelativeToFlowchart({
          x: event.x,
          y: event.y,
        })
      );
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
}
