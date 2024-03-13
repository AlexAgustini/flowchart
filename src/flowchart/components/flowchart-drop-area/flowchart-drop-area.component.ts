import { DragService } from './../../services/drag.service';
import { Component, HostListener } from '@angular/core';
import { FlowchartStepComponent } from '../flowchart-step-component/flowchart-step.component';
import { FlowBlocksEnum } from '../../helpers/flowchart-steps-registry';

@Component({
  templateUrl: './flowchart-drop-area.component.html',
  selector: 'drop-area',
  standalone: true,
})
export class FlowchartDropAreaComponent extends FlowchartStepComponent {
  constructor(private dragService: DragService) {
    super();
  }

  /**
   * Observa drops de steps
   * @param event Evento de drag
   */
  @HostListener('drop', ['$event']) private onDrop(event: DragEvent) {
    const stepName = this.dragService.getDragData('STEP_NAME');
    const data = this.dragService.getDragData('data');

    this.removeSelf();
    this.parent.addChild({
      id: this.id,
      type: stepName as FlowBlocksEnum,
      data,
    });
  }

  @HostListener('dragover', ['$event'])
  private onDragOver(e) {
    // e.preventDefault();
  }

  @HostListener('dragenter', ['$event'])
  private onDragEnter(e) {
    // e.preventDefault();
    this.dragService.isDraggingOverDropAreaOrPath = true;

    const stepName = this.dragService.getDragData('STEP_NAME');

    this.removeSelf();
    this.previewStep = this.parent.addChild({
      type: stepName,
    });

    this.parent.toggleTreeOpacity();
  }

  @HostListener('dragleave', ['$event']) dragEnd() {
    console.log('dragend');
    this.previewStep.removeSelf();
  }

  previewStep: FlowchartStepComponent;

  override ngOnDestroy() {
    setTimeout(() => {
      this.dragService.isDraggingOverDropAreaOrPath = false;
    }, 100);
  }
}
