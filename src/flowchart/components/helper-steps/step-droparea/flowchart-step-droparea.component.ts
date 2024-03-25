import { Component, HostListener } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartDragService } from '../../../services/flowchart-drag.service';

@Component({
  selector: 'step-droparea',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './flowchart-step-droparea.component.html',
  styleUrl: './flowchart-step-droparea.component.scss',
})
export class FlowchartStepDropareaComponent extends FlowchartStepComponent {
  /**
   * Serviço de drag
   */
  private readonly flowchartDragService: FlowchartDragService;

  ngOnInit() {
    this.dragDir.disabled = true;
  }

  constructor(flowchartDragService: FlowchartDragService) {
    super();
    this.flowchartDragService = flowchartDragService;
  }

  /**
   * HostListener para evento de dragEnter
   */
  @HostListener('dragenter') onDragEnter(): void {
    this.flowchartDragService.dropareaCoordinates = this.getCoordinates();
    this.flowchartDragService.createDropPlaceholder(this.parent);
  }

  @HostListener('click') private onClick() {
    if (this.flowchartStepsService.stepclone) {
      this.removeSelf();
      this.flowchartStepsService.createStepWithoutStepResults({
        pendingStep: this.flowchartStepsService.stepclone,
        parentStep: this.parent,
        asSibling: true,
      });
    }
  }
}
