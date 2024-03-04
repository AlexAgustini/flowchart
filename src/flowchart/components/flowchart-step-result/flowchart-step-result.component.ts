import { Component } from '@angular/core';
import { FlowchartStepDynamicComponent } from '../flowchart-step-dynamic-component/flowchart-step-dynamic.component';

@Component({
  templateUrl: './flowchart-step-result.component.html',
  styleUrl: './flowchart-step-result.component.scss',
  standalone: true,
})
export class FlowchartStepResultComponent extends FlowchartStepDynamicComponent {
  static override STEP_NAME: string = 'STEP_RESULT';

  protected ngOnInit(): void {
    setTimeout(() => {
      this.addChild();
    }, 0);
  }

  protected override addChild(): void {
    super.addChild({ STEP_NAME: 'DROP_AREA' });
  }
}
