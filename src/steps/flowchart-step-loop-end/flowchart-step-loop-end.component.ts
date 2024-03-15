import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';

@Component({
  selector: 'flowchart-step-loop-end-component',
  templateUrl: './flowchart-step-loop-end.component.html',
})
export class FlowchartStepLoopEndComponent extends FlowchartStepComponent {
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }
}
