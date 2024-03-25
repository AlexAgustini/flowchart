import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';

@Component({
  selector: 'flowchart-step-flow-request-component',
  templateUrl: './flowchart-step-flow-request-component.html',
})
export class FlowchartStepFlowRequestComponent extends FlowchartStepComponent {
  public override afterChildrenInit = () => {
    this.flowchartStepsService.setStepInitialCoordinates(this);
  };
}
