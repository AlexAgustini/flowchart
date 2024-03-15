import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import { FlowStepsEnum } from '../../flowchart/helpers/flowchart-steps-registry';
import { FlowchartStepResultsEnum } from '../../flowchart/helpers/flowchart-step-results-enum';

@Component({
  selector: 'initial-step',
  templateUrl: './initial-step.component.html',
})
export class InitialStepComponent extends FlowchartStepComponent {
  public override stepResultType: FlowchartStepResultsEnum = null;

  override ngOnInit(): void {
    super.ngOnInit();
  }
}
