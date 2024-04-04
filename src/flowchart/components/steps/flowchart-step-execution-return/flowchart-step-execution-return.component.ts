import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartStepsEnum } from '../../../enums/flowchart-steps.enum';

@Component({
  selector: 'flowchart-step-execution-return-component',
  templateUrl: './flowchart-step-execution-return.component.html',
})
export class FlowchartStepExecutionReturnComponent extends FlowchartStepComponent {
  public override afterChildrenInit = () => {
    if (this.children?.[0]?.type == FlowchartStepsEnum.STEP_DROPAREA) {
      this.children[0].removeSelf();
    }
  };
}
