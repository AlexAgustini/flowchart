import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartStepResultsEnum } from '../../../enums/flowchart-step-results-enum';

@Component({
  selector: 'flowchart-step-script-component',
  templateUrl: './flowchart-step-script.component.html',
})
export class FlowchartStepScriptComponent extends FlowchartStepComponent {}
