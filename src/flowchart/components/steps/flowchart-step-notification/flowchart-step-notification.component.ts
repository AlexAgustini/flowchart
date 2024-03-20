import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartStepResultsEnum } from '../../../enums/flowchart-step-results-enum';
import { FlowchartStepsEnum } from '../../../enums/flowchart-steps.enum';

@Component({
  selector: 'flowchart-step-notification-component',
  templateUrl: './flowchart-step-notification.component.html',
})
export class FlowchartStepNotificationComponent extends FlowchartStepComponent {
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
