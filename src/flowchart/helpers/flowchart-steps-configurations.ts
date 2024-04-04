import { FlowchartStepResultsEnum } from '../enums/flowchart-step-results-enum';
import { FlowchartStepsEnum } from '../enums/flowchart-steps.enum';

export type FlowchartStepConfiguration = {
  stepType: FlowchartStepsEnum;
  stepResults?: Array<{
    path: FlowchartStepResultsEnum;
    required?: boolean;
  }>;
  canDropInBetweenSteps?: boolean;
};

export const FlowchartStepsConfiguration: Array<FlowchartStepConfiguration> = [
  {
    stepType: FlowchartStepsEnum.STEP_FLOW_REQUEST,
    stepResults: [{ path: FlowchartStepResultsEnum.SUCCESS }],
  },
  {
    stepType: FlowchartStepsEnum.STEP_COLLECTION_REQUEST,
    stepResults: [{ path: FlowchartStepResultsEnum.SUCCESS }, { path: FlowchartStepResultsEnum.ERROR }],
  },
  {
    stepType: FlowchartStepsEnum.STEP_NOTIFICATION,
    stepResults: [{ path: FlowchartStepResultsEnum.SUCCESS }],
  },
  {
    stepType: FlowchartStepsEnum.STEP_SCRIPT,
    stepResults: [{ path: FlowchartStepResultsEnum.SUCCESS }],
  },
  {
    stepType: FlowchartStepsEnum.STEP_LOOP_START,
    stepResults: [{ path: FlowchartStepResultsEnum.PER_ITEM }],
  },
  {
    stepType: FlowchartStepsEnum.STEP_LOOP_END,
    stepResults: [{ path: FlowchartStepResultsEnum.LOOP_END }],
  },
  {
    stepType: FlowchartStepsEnum.STEP_REQUEST,
    stepResults: [{ path: FlowchartStepResultsEnum.SUCCESS }, { path: FlowchartStepResultsEnum.ERROR }],
  },
  {
    stepType: FlowchartStepsEnum.STEP_CONDITIONAL,
    stepResults: [{ path: FlowchartStepResultsEnum.TRUE }, { path: FlowchartStepResultsEnum.FALSE, required: true }],
  },
  {
    stepType: FlowchartStepsEnum.STEP_FINALIZATION,
    stepResults: [],
    canDropInBetweenSteps: false,
  },
  {
    stepType: FlowchartStepsEnum.STEP_EXECUTION_RETURN,
    canDropInBetweenSteps: false,
  },
];
