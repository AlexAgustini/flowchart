import { Component } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartStepsEnum } from '../../../enums/flowchart-steps.enum';

@Component({
  selector: 'step-result-label',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './flowchart-step-result.component.html',
  styleUrl: './flowchart-step-result.component.scss',
})
export class FlowchartStepResultComponent extends FlowchartStepComponent {
  public override type = FlowchartStepsEnum.STEP_RESULT;

  ngOnInit() {
    this.dragDir.disabled = true;
  }

  override afterChildrenInit = (): void => {
    if (this.children.length) return;
    this.addDroparea();
  };
}
