import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';

@Component({
  selector: 'flowchart-step-finalization-component',
  templateUrl: './flowchart-step-finalization.component.html',
})
export class FlowchartStepFinalizationComponent extends FlowchartStepComponent {
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }
}
