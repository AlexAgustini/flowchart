import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import { FlowchartStepResultsEnum } from '../../flowchart/helpers/flowchart-step-results-enum';

@Component({
  selector: 'flowchart-step-collection-component',
  templateUrl: './flowchart-step-collection.component.html',
})
export class FlowchartStepCollectionComponent extends FlowchartStepComponent {
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }
}
