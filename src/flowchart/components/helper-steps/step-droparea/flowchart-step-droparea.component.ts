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

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.renderer2.removeClass(this.elementRef.nativeElement, 'flowchart-step');
  }

  constructor(flowchartDragService: FlowchartDragService) {
    super();
    this.flowchartDragService = flowchartDragService;
  }

  /**
   * HostListener para evento de dragEnter
   */
  @HostListener('dragenter') onDragEnter(): void {
    this.applyDragStyles();
    this.flowchartDragService.dropareaCoordinates = this.getCoordinates();
  }

  /**
   * HostListener para evento de dragLeave
   */
  @HostListener('dragleave') onDragLeave() {
    this.removeDragStyles();
  }

  /**
   * HostListener para evento de drop
   */
  @HostListener('drop') onDrop(): void {
    this.removeDragStyles();
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

  private applyDragStyles(): void {
    this.renderer2.addClass(this.elementRef.nativeElement, 'dragover');
    const connector = this.flowchartRendererService.connectors.find((connector) => connector.childId == this.id).path;

    connector.style.stroke = 'var(--primary-color)';
    connector.style.strokeWidth = '3px';
  }

  private removeDragStyles(): void {
    this.renderer2.removeClass(this.elementRef.nativeElement, 'dragover');
    const connector = this.flowchartRendererService.connectors.find((connector) => connector.childId == this.id).path;
    connector.style.stroke = 'gray';
    connector.style.strokeWidth = '1px';
  }
}
