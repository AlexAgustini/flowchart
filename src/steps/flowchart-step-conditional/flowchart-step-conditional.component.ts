import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';

@Component({
  selector: 'flowchart-step-conditional-component',
  templateUrl: './flowchart-step-conditional.component.html',
})
export class FlowchartStepConditionalComponent extends FlowchartStepComponent {
  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override removeSelf(recursive?: boolean): void {
    super.removeSelf(recursive);
    if (!recursive) {
      const oldPath = this.children[0].children[0];

      setTimeout(() => {
        oldPath?.restoreDragCoordinatesToBeforeBeingAffectedByPlaceholder();
      }, 0);
    }
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }
}
