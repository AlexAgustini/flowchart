import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartStepsEnum } from '../../../enums/flowchart-steps.enum';

@Component({
  selector: 'flowchart-step-finalization-component',
  templateUrl: './flowchart-step-finalization.component.html',
})
export class FlowchartStepFinalizationComponent extends FlowchartStepComponent {
  public override afterChildrenInit = () => {
    if (this.children?.[0]?.type == FlowchartStepsEnum.STEP_DROPAREA) {
      this.children[0].removeSelf();
    }
  };
}
