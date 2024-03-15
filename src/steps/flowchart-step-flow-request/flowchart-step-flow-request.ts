import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';

@Component({
  selector: 'flowchart-step-flow-request-component',
  templateUrl: './flowchart-step-flow-request.html',
})
export class FlowchartStepFlowRequestComponent extends FlowchartStepComponent {
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }
}
