import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartStepsEnum } from '../../../enums/flowchart-steps.enum';
import { FlowchartStepResultsEnum } from '../../../enums/flowchart-step-results-enum';

@Component({
  selector: 'flowchart-step-flow-request-component',
  templateUrl: './flowchart-step-flow-request.html',
})
export class FlowchartStepFlowRequestComponent extends FlowchartStepComponent {
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();

    this.addChild({
      pendingComponent: {
        type: FlowchartStepsEnum.STEP_RESULT,
        data: {
          resultType: FlowchartStepResultsEnum.SUCCESS,
        },
      },
    });
  }
}
