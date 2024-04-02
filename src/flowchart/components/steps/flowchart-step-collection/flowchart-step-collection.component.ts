import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';

@Component({
  selector: 'flowchart-step-collection-component',
  templateUrl: './flowchart-step-collection.component.html',
})
export class FlowchartStepCollectionComponent extends FlowchartStepComponent {
  log() {
    console.log(this.data);
  }
}
