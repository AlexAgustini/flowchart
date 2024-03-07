import { FlowBlockTypes } from './../../helpers/flowchart-steps-registry';
import { DragService } from './../../services/drag.service';
import { Component, HostListener } from '@angular/core';
import { FlowchartStepComponent } from '../flowchart-step-component/flowchart-step.component';

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
    const stepName = event.dataTransfer.getData('STEP_NAME');
    const data = event.dataTransfer.getData('data');
    const coordinates = this.getCoordinates();

    this.removeSelf();
    this.parent.addChild({
      id: this.id,
      STEP_NAME: stepName as FlowBlockTypes,
      data,
      coordinates,
    });
  }

  @HostListener('dragover', ['$event'])
  private onDragOver(e) {
    e.preventDefault();
  }

  @HostListener('dragenter', ['$event'])
  private onDragEnter(e) {
    e.preventDefault();
    this.dragService.isHoveringOverDropArea = true;
  }

  override ngOnDestroy() {
    setTimeout(() => {
      this.dragService.isHoveringOverDropArea = false;
    }, 100);
  }
}
