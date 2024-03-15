import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import { FlowStepsEnum } from '../../flowchart/helpers/flowchart-steps-registry';
import { FlowchartStepResultsEnum } from '../../flowchart/helpers/flowchart-step-results-enum';

@Component({
  selector: 'block1',
  templateUrl: './block1.component.html',
})
export class Block1Component extends FlowchartStepComponent {
  public override stepResultType:
    | FlowchartStepResultsEnum
    | FlowchartStepResultsEnum[] = FlowchartStepResultsEnum.SUCCESS;

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    setTimeout(() => {
      if (this.children[0]?.type == FlowStepsEnum.STEP_RESULT) return;
      this.addChild({
        pendingComponent: { type: FlowStepsEnum.STEP_RESULT },
        asSibling: false,
      });
    }, 0);
  }
}
