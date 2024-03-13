import { Component } from '@angular/core';
import { FlowchartStepComponent } from '../../flowchart/components/flowchart-step-component/flowchart-step.component';
import { FlowBlocksEnum } from '../../flowchart/helpers/flowchart-steps-registry';

@Component({
  selector: 'conditional-block',
  templateUrl: './conditional-block.component.html',
})
export class ConditionalBlock extends FlowchartStepComponent {
  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override removeSelf(recursive?: boolean): void {
    super.removeSelf(true);
  }

  override ngAfterViewInit(): void {
    const child = this.children[0];

    super.ngAfterViewInit();
    this.addChild({
      type: FlowBlocksEnum.STEP_RESULT,
    });
    this.addChild({
      type: FlowBlocksEnum.STEP_RESULT,
    });

    if (child) {
      child.removeSelf();

      this.children[1].addChild(child as any);
    }
  }
}
