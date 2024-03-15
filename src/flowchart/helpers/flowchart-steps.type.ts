import { Block1Component } from '../../steps/block1/block1.component';
import { Block2Component } from '../../steps/block2/block2.component';
import { ConditionalBlock } from '../../steps/conditional-block/conditional-block.component';
import { InitialStepComponent } from '../../steps/initial-step/initial-step.component';
import { StepResultComponent } from '../../steps/step-result/step-result.component';

export type FlowchartStepsType =
  | InitialStepComponent
  | StepResultComponent
  | ConditionalBlock
  | Block1Component
  | Block2Component;
