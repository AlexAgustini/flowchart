import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../flowchart-step-component/flowchart-step.component';
import { FlowBlockTypes } from '../../helpers/flowchart-steps-registry';

@Component({
  templateUrl: './flowchart-step-result.component.html',
  styleUrl: './flowchart-step-result.component.scss',
  standalone: true,
})
export class FlowchartStepResultComponent extends FlowchartStepComponent {
  static override STEP_NAME: FlowBlockTypes = 'STEP_RESULT';

  override ngOnInit(): void {
    setTimeout(() => {
      if (!this.children?.length) {
        this.addChild({ STEP_NAME: 'DROP_AREA' });
      }
    }, 0);
  }
}
