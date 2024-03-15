import { Type } from '@angular/core';
import { FlowchartStepsEnum } from './flowchart-steps.enum';
import { FlowchartStepInitialComponent } from '../../steps/flowchart-step-initial/flowchart-step-initial.component';
import { FlowchartStepConditionalComponent } from '../../steps/flowchart-step-conditional/flowchart-step-conditional.component';
import { FlowchartStepResultComponent } from '../../steps/flowchart-step-result/flowchart-step-result.component';
import { FlowchartStepFinalizationComponent } from '../../steps/flowchart-step-finalization/flowchart-step-finalization.component';
import { FlowchartStepScriptComponent } from '../../steps/flowchart-step-script/flowchart-step-script.component';
import { FlowchartStepRequestComponent } from '../../steps/flowchart-step-request/flowchart-step-request.component';
import { FlowchartStepFlowRequestComponent } from '../../steps/flowchart-step-flow-request/flowchart-step-flow-request';
import { FlowchartStepCollectionComponent } from '../../steps/flowchart-step-collection/flowchart-step-collection.component';
import { FlowchartStepLoopStartComponent } from '../../steps/flowchart-step-loop-start/flowchart-step-loop-start.component';
import { FlowchartStepLoopEndComponent } from '../../steps/flowchart-step-loop-end/flowchart-step-loop-end.component';
import { FlowchartStepNotificationComponent } from '../../steps/flowchart-step-notification/flowchart-step-notification.component';

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
];
