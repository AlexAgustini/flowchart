import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import { StepResultComponent } from '../step-result/step-result.component';
import { FlowBlocksEnum } from '../../flowchart/helpers/flowchart-steps-registry';

@Component({
  selector: 'initial-step',
  templateUrl: './initial-step.component.html',
})
export class InitialStepComponent extends FlowchartStepComponent {
  public STEP_NAME = FlowBlocksEnum.INITIAL_STEP;
  public addErrorPath() {
    this.addChild({ type: FlowBlocksEnum.STEP_RESULT, parent: this }, false);
  }
}
