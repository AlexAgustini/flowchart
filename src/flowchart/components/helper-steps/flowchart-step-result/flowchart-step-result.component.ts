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

  override ngOnInit() {
    super.ngOnInit();
    this.dragDir.disabled = true;
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();

    // this.addChild({
    //   pendingComponent: {
    //     type: FlowchartStepsEnum.STEP_DROPAREA
    //   }
    // })
  }
}
