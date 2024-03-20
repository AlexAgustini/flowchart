import {
  FlowchartStepInitialComponent,
  FlowchartStepCollectionComponent,
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
  | FlowchartStepCollectionComponent
  | FlowchartStepConditionalComponent
  | FlowchartStepFinalizationComponent
  | FlowchartStepFlowRequestComponent
  | FlowchartStepLoopEndComponent
  | FlowchartStepLoopStartComponent
  | FlowchartStepNotificationComponent
  | FlowchartStepRequestComponent
  | FlowchartStepScriptComponent
  | any;
