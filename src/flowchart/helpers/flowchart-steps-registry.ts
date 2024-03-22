import { Type } from '@angular/core';
import {
  FlowchartStepCollectionComponent,
  FlowchartStepConditionalComponent,
  FlowchartStepFinalizationComponent,
  FlowchartStepFlowRequestComponent,
  FlowchartStepInitialComponent,
  FlowchartStepLoopEndComponent,
  FlowchartStepLoopStartComponent,
  FlowchartStepNotificationComponent,
  FlowchartStepRequestComponent,
  FlowchartStepScriptComponent,
} from '../components/steps';
import { FlowchartStepsEnum } from '../enums/flowchart-steps.enum';
import { FlowchartStepResultComponent } from '../components/helper-steps/flowchart-step-result/flowchart-step-result.component';
import { FlowchartStepDropareaComponent } from '../components/helper-steps/step-droparea/flowchart-step-droparea.component';

export const stepsObj: Array<{
  type: FlowchartStepsEnum;
  component: Type<any>;
}> = [
  {
    type: FlowchartStepsEnum.STEP_INITIAL,
    component: FlowchartStepInitialComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_FINALIZATION,
    component: FlowchartStepFinalizationComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_SCRIPT,
    component: FlowchartStepScriptComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_REQUEST,
    component: FlowchartStepRequestComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_FLOW_REQUEST,
    component: FlowchartStepFlowRequestComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_COLLECTION,
    component: FlowchartStepCollectionComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_NOTIFICATION,
    component: FlowchartStepNotificationComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_LOOP_START,
    component: FlowchartStepLoopStartComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_LOOP_END,
    component: FlowchartStepLoopEndComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_CONDITIONAL,
    component: FlowchartStepConditionalComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_RESULT,
    component: FlowchartStepResultComponent,
  },
  {
    type: FlowchartStepsEnum.STEP_DROPAREA,
    component: FlowchartStepDropareaComponent,
  },
];
