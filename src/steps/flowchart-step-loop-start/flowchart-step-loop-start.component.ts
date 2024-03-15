import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';

@Component({
  selector: 'flowchart-step-loop-start-component',
  templateUrl: './flowchart-step-loop-start.component.html',
})
export class FlowchartStepLoopStartComponent extends FlowchartStepComponent {
  override ngAfterViewInit(): void {}
}
