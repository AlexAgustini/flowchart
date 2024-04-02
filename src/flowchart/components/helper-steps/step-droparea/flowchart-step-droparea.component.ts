import { Component, HostBinding, HostListener } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartDragService } from '../../../services/flowchart-drag.service';
import { CdkDragMove } from '@angular/cdk/drag-drop';

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
    this.transform = `${this.elementRef.nativeElement.style.transform} rotate(45deg)`;
  }

  constructor(flowchartDragService: FlowchartDragService) {
    super();
    this.flowchartDragService = flowchartDragService;
  }

  @HostBinding('style.transform') transform;

  /**
   * HostListener para evento de dragEnter
   */
  @HostListener('dragenter') onDragEnter(): void {
    this.flowchartDragService.dropareaCoordinates = this.getCoordinates();
    this.transform = `${this.elementRef.nativeElement.style.transform} scale(1.3)`;
    this.elementRef.nativeElement.classList.toggle('dragover');
  }

  @HostListener('dragleave') onDragLeave() {
    this.transform = `${this.transform}`.replace('scale(1.3)', '');
    this.elementRef.nativeElement.classList.toggle('dragover');
  }

  /**
   * HostListener para evento de dragEnter
   */
  @HostListener('drop') onDrop(): void {
    this.parent.addChild({
      pendingComponent: { type: this.flowchartDragService.getDragData('STEP_TYPE') },
      asSibling: false,
    });
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
