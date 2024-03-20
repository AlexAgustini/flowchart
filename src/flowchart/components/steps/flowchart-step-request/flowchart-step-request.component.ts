import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartStepResultsEnum } from '../../../enums/flowchart-step-results-enum';
import { FlowchartStepsEnum } from '../../../enums/flowchart-steps.enum';

@Component({
  selector: 'flowchart-step-request-component',
  templateUrl: './flowchart-step-request.component.html',
})
export class FlowchartStepRequestComponent extends FlowchartStepComponent {
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();

    this.addResultLabel(FlowchartStepResultsEnum.SUCCESS);
  }

  public addErrorPath() {
    this.addChild({
      pendingComponent: {
        type: FlowchartStepsEnum.STEP_RESULT,
        data: {
          resultType: FlowchartStepResultsEnum.ERROR,
        },
      },
      asSibling: true,
    });
  }

  public removeErrorPath() {
    this.children[1].removeSelf(true);
    setTimeout(() => {
      this.reCenterChildren();
    }, 0);
  }
}
