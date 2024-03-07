import { Type } from '@angular/core';
import { FlowchartStepResultComponent } from '../components/flowchart-step-result/flowchart-step-result.component';
import { FlowchartDropAreaComponent } from '../components/flowchart-drop-area/flowchart-drop-area.component';
import { Block3Component } from '../../steps/block3/block3.component';
import { Block1Component } from '../../steps/block1/block1.component';
import { Block2Component } from '../../steps/block2/block2.component';

export type FlowBlockTypes =
  | 'STEP_RESULT'
  | 'DROP_AREA'
  | 'BLOCK_1'
  | 'BLOCK_2'
  | 'BLOCK_3';

export const stepsMap = new Map<FlowBlockTypes, Type<any>>([
  ['STEP_RESULT', FlowchartStepResultComponent],
  ['DROP_AREA', FlowchartDropAreaComponent],
  ['BLOCK_1', Block1Component],
  ['BLOCK_2', Block2Component],
  ['BLOCK_3', Block3Component],
]);
