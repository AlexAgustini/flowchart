import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import { FlowBlocksEnum } from '../../flowchart/helpers/flowchart-steps-registry';

@Component({
  selector: 'block1',
  templateUrl: './block1.component.html',
})
export class Block1Component extends FlowchartStepComponent {
  public addErrorPath() {
    this.addChild({ type: FlowBlocksEnum.STEP_RESULT, parent: this });
  }
}
