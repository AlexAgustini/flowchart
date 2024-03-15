import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';

@Component({
  selector: 'flowchart-step-initial-component',
  templateUrl: './flowchart-step-initial.component.html',
})
export class FlowchartStepInitialComponent extends FlowchartStepComponent {
  override ngOnInit(): void {
    super.ngOnInit();
  }
}
