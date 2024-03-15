import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import { FlowStepsEnum } from '../../flowchart/helpers/flowchart-steps-registry';
import { FlowchartStepResultDataType } from '../step-result/data/flowchart-step-result-data.type';
import { FlowchartStepResultsEnum } from '../../flowchart/helpers/flowchart-step-results-enum';

@Component({
  selector: 'block2',
  templateUrl: './block2.component.html',
})
export class Block2Component extends FlowchartStepComponent {
  public override stepResultType:
    | FlowchartStepResultsEnum
    | FlowchartStepResultsEnum[] = FlowchartStepResultsEnum.SUCCESS;
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    setTimeout(() => {
      if (this.children[0]?.type == FlowStepsEnum.STEP_RESULT) return;
      this.addChild<FlowchartStepResultDataType>({
        pendingComponent: {
          type: FlowStepsEnum.STEP_RESULT,
          data: { resultType: FlowchartStepResultsEnum.SUCCESS },
        },
        asSibling: false,
      });
    }, 0);
  }
}
