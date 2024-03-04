import { Type } from '@angular/core';
import { MockComponent } from '../mock/mock.component';
import { FlowchartStepResultComponent } from '../components/flowchart-step-result/flowchart-step-result.component';
import { FlowchartDropAreaComponent } from '../components/flowchart-drop-area/flowchart-drop-area.component';

export const stepsMap = new Map<string, Type<any>>([
  ['MOCK', MockComponent],
  ['STEP_RESULT', FlowchartStepResultComponent],
  ['DROP_AREA', FlowchartDropAreaComponent],
]);
