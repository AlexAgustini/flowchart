import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartStepsEnum } from '../../../enums/flowchart-steps.enum';
import { FlowchartStepResultsEnum } from '../../../enums/flowchart-step-results-enum';

@Component({
  selector: 'flowchart-step-conditional-component',
  templateUrl: './flowchart-step-conditional.component.html',
})
export class FlowchartStepConditionalComponent extends FlowchartStepComponent {
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

    this.addChild({
      pendingComponent: {
        type: FlowchartStepsEnum.STEP_RESULT,
        data: {
          resultType: FlowchartStepResultsEnum.TRUE,
        },
      },
    });

    this.addChild({
      pendingComponent: {
        type: FlowchartStepsEnum.STEP_RESULT,
        data: {
          resultType: FlowchartStepResultsEnum.FALSE,
        },
      },
      asSibling: true,
    });
  }
}
