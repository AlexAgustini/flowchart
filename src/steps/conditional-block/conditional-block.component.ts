import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import * as _ from 'lodash';
import { FlowchartStepResultsEnum } from '../../flowchart/helpers/flowchart-step-results-enum';
import { FlowStepsEnum } from '../../flowchart/helpers/flowchart-steps-registry';
import { FlowchartStepResultDataType } from '../step-result/data/flowchart-step-result-data.type';
import { FlowchartStepCoordinates } from '../../flowchart/types/flowchart-step.type';
@Component({
  selector: 'conditional-block',
  templateUrl: './conditional-block.component.html',
})
export class ConditionalBlock extends FlowchartStepComponent {
  public override stepResultType = [
    FlowchartStepResultsEnum.TRUE,
    FlowchartStepResultsEnum.FALSE,
  ];

  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override removeSelf(recursive?: boolean): void {
    super.removeSelf(recursive);
    if (!recursive) {
      const oldPath = this.children[0].children[0];

      setTimeout(() => {
        oldPath?.restoreDragCoordinatesToBeforeBeingAffectedByPlaceholder();
      }, 0);
    }
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();

    this.addChild<FlowchartStepResultDataType>({
      pendingComponent: {
        type: FlowStepsEnum.STEP_RESULT,
        data: {
          resultType: FlowchartStepResultsEnum.TRUE,
        },
      },
    });

    this.addChild<FlowchartStepResultDataType>({
      pendingComponent: {
        type: FlowStepsEnum.STEP_RESULT,
        data: {
          resultType: FlowchartStepResultsEnum.FALSE,
        },
      },
      asSibling: true,
    });
  }
}
