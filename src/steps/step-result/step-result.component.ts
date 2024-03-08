import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import { FlowBlocksEnum } from '../../flowchart/helpers/flowchart-steps-registry';
@Component({
  templateUrl: './step-result.component.html',
  styleUrl: './step-result.component.scss',
  standalone: true,
})
export class StepResultComponent extends FlowchartStepComponent {
  public STEP_NAME = FlowBlocksEnum.STEP_RESULT;
  override ngOnInit(): void {
    setTimeout(() => {
      if (!this.children?.length) {
        this.addChild({ type: FlowBlocksEnum.DROP_AREA });
      }
    }, 0);
  }
}
