import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';

@Component({
  selector: 'flowchart-step-collection-request-component',
  templateUrl: './flowchart-step-collection-request.component.html',
})
export class FlowchartStepCollectionRequestComponent extends FlowchartStepComponent {
  log() {
    console.log(this.data);
  }
}
