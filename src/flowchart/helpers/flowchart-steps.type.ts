import { Block1Component } from '../../steps/flowchart-step-script/flowchart-step-script.component';
import { Block2Component } from '../../steps/block2/block2.component';
import { ConditionalBlock } from '../../steps/conditional-block/conditional-block.component';
import { InitialStepComponent } from '../../steps/flowchart-step-initial/flowchart-step-initial.component';
import { StepResultComponent } from '../../steps/flowchart-step-result/flowchart-step-result.component';

export type FlowchartStepsType =
  | InitialStepComponent
  | StepResultComponent
  | ConditionalBlock
  | Block1Component
  | Block2Component;
