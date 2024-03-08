import { StepResultComponent } from '../../steps/step-result/step-result.component';
import { FlowchartDropAreaComponent } from '../components/flowchart-drop-area/flowchart-drop-area.component';
import { Block1Component } from '../../steps/block1/block1.component';
import { Block2Component } from '../../steps/block2/block2.component';
import { Type } from '@angular/core';
import { InitialStepComponent } from '../../steps/initial-step/initial-step.component';

export enum FlowBlocksEnum {
  INITIAL_STEP = 'INITIAL_STEP',
  STEP_RESULT = 'STEP_RESULT',
  DROP_AREA = 'DROP_AREA',
  BLOCK_1 = 'BLOCK_1',
  BLOCK_2 = 'BLOCK_2',
}

export const stepsObj: Array<{
  type: FlowBlocksEnum;
  component: Type<any>;
}> = [
  {
    type: FlowBlocksEnum.INITIAL_STEP,
    component: InitialStepComponent,
  },
  {
    type: FlowBlocksEnum.STEP_RESULT,
    component: StepResultComponent,
  },
  { type: FlowBlocksEnum.DROP_AREA, component: FlowchartDropAreaComponent },
  { type: FlowBlocksEnum.BLOCK_1, component: Block1Component },
  { type: FlowBlocksEnum.BLOCK_2, component: Block2Component },
];
