import { Component, HostListener, inject } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartStepsEnum } from '../../../enums/flowchart-steps.enum';
import { DragService } from '../../../services/flowchart-drag.service';

@Component({
  selector: 'step-droparea',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './flowchart-step-droparea.component.html',
  styleUrl: './flowchart-step-droparea.component.scss',
})
export class FlowchartStepDropareaComponent extends FlowchartStepComponent {
  public override type = FlowchartStepsEnum.STEP_DROPAREA;

  override ngOnInit() {
    super.ngOnInit();
    this.dragDir.disabled = true;
  }

  @HostListener('dragenter') a() {
    // this.removeSelf();
    // this.d.createDropPlaceholder({
    //   dimensions: this.parent.getCoordinates(),
    //   id: this.parent.id,
    // });
  }

  d = inject(DragService);
}
