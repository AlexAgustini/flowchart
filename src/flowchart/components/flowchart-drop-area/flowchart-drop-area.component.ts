import { Component, HostListener } from '@angular/core';
import { FlowchartStepDynamicComponent } from '../flowchart-step-dynamic-component/flowchart-step-dynamic.component';

@Component({
  templateUrl: './flowchart-drop-area.component.html',
  standalone: true,
})
export class FlowchartDropAreaComponent extends FlowchartStepDynamicComponent {
  constructor() {
    super();
  }

  /**
   * Observa drops de steps
   * @param event Evento de drag
   */
  @HostListener('drop', ['$event']) private onDrop(event: DragEvent) {
    const stepName = event.dataTransfer.getData('STEP_NAME');
    const data = event.dataTransfer.getData('data');
    const canDropAnywhere = event.dataTransfer.getData('canDropAnywhere');

    this.associatedStep.removeAssociatedComponent();
    this.associatedStep.createAssociatedComponent({
      STEP_NAME: stepName,
      data,
    });
  }

  @HostListener('dragover', ['$event'])
  private onDragOver(e) {
    e.preventDefault();
  }
}
