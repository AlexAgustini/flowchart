import { StepResultComponent } from '../../steps/step-result/step-result.component';
import { Block1Component } from '../../steps/block1/block1.component';
import { Block2Component } from '../../steps/block2/block2.component';
import { Type } from '@angular/core';
import { InitialStepComponent } from '../../steps/initial-step/initial-step.component';
import { ConditionalBlock } from '../../steps/conditional-block/conditional-block.component';

export enum FlowStepsEnum {
  INITIAL_STEP = 'INITIAL_STEP',
  STEP_RESULT = 'STEP_RESULT',
  CONDITIONAL = 'CONDITIONAL',
  BLOCK_1 = 'BLOCK_1',
  BLOCK_1_PLACEHOLDER = 'BLOCK_1_PLACEHOLDER',
  BLOCK_2 = 'BLOCK_2',
}

export const stepsObj: Array<{
  type: FlowStepsEnum;
  component: Type<any>;
}> = [
  {
    type: FlowStepsEnum.INITIAL_STEP,
    component: InitialStepComponent,
  },
  {
    type: FlowStepsEnum.CONDITIONAL,
    component: ConditionalBlock,
  },
  {
    type: FlowStepsEnum.STEP_RESULT,
    component: StepResultComponent,
  },
  {
    type: FlowStepsEnum.BLOCK_1,
    component: Block1Component,
  },
  { type: FlowStepsEnum.BLOCK_2, component: Block2Component },
];
