import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { FlowchartStepDropareaComponent } from '../../helper-steps/step-droparea/flowchart-step-droparea.component';

@Component({
  selector: 'flowchart-step-finalization-component',
  templateUrl: './flowchart-step-finalization.component.html',
})
export class FlowchartStepFinalizationComponent extends FlowchartStepComponent {
  public override canDropInBetweenSteps = false;

  public override afterChildrenInit = () => {
    if (this.children[0] instanceof FlowchartStepDropareaComponent) {
      this.children[0].removeSelf();
    }
  };

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    this.parent.addDroparea();
    console.log('ondestroy');
  }
}
