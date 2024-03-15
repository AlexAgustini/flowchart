import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import { FlowchartStepResultDataType } from './data/flowchart-step-result-data.type';
import { NgIf } from '@angular/common';
import { FlowchartStepResultsEnum } from '../../flowchart/helpers/flowchart-step-results-enum';
@Component({
  templateUrl: './flowchart-step-result.component.html',
  styleUrl: './flowchart-step-result.component.scss',
  imports: [NgIf],
  standalone: true,
})
export class FlowchartStepResultComponent extends FlowchartStepComponent<FlowchartStepResultDataType> {
  public flowchartStepResultEnum = FlowchartStepResultsEnum;
  override ngOnInit(): void {
    super.ngOnInit();
  }
}
