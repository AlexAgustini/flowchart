import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import { StepResultComponent } from '../step-result/step-result.component';

@Component({
  selector: 'block1',
  templateUrl: './block1.component.html',
})
export class Block1Component extends FlowchartStepComponent {
  public addErrorPath() {
    this.addChild(
      { STEP_NAME: StepResultComponent.STEP_NAME, parent: this },
      false
    );
  }
}
