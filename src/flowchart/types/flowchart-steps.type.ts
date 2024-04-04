import {
  FlowchartStepInitialComponent,
  FlowchartStepCollectionRequestComponent,
  FlowchartStepConditionalComponent,
  FlowchartStepFinalizationComponent,
  FlowchartStepFlowRequestComponent,
  FlowchartStepLoopEndComponent,
  FlowchartStepLoopStartComponent,
  FlowchartStepNotificationComponent,
  FlowchartStepRequestComponent,
  FlowchartStepScriptComponent,
} from '../components/steps';

export type FlowchartStepsComponents =
  | FlowchartStepInitialComponent
  | FlowchartStepCollectionRequestComponent
  | FlowchartStepConditionalComponent
  | FlowchartStepFinalizationComponent
  | FlowchartStepFlowRequestComponent
  | FlowchartStepLoopEndComponent
  | FlowchartStepLoopStartComponent
  | FlowchartStepNotificationComponent
  | FlowchartStepRequestComponent
  | FlowchartStepScriptComponent
  | any;
