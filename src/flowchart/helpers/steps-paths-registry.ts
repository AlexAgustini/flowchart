import { FlowchartStepResultsEnum } from '../enums/flowchart-step-results-enum';
import { FlowchartStepsEnum } from '../enums/flowchart-steps.enum';

export const StepsPathsRegistry: Array<{
  type: FlowchartStepsEnum;
  pathsResultTypes: Array<{
    path: FlowchartStepResultsEnum;
    required?: boolean;
  }>;
}> = [
  {
    type: FlowchartStepsEnum.STEP_FLOW_REQUEST,
    pathsResultTypes: [{ path: FlowchartStepResultsEnum.SUCCESS }],
  },
  {
    type: FlowchartStepsEnum.STEP_COLLECTION,
    pathsResultTypes: [{ path: FlowchartStepResultsEnum.SUCCESS }],
  },
  {
    type: FlowchartStepsEnum.STEP_NOTIFICATION,
    pathsResultTypes: [{ path: FlowchartStepResultsEnum.SUCCESS }],
  },
  {
    type: FlowchartStepsEnum.STEP_SCRIPT,
    pathsResultTypes: [{ path: FlowchartStepResultsEnum.SUCCESS }],
  },
  {
    type: FlowchartStepsEnum.STEP_LOOP_START,
    pathsResultTypes: [{ path: FlowchartStepResultsEnum.PER_ITEM }],
  },
  {
    type: FlowchartStepsEnum.STEP_REQUEST,
    pathsResultTypes: [{ path: FlowchartStepResultsEnum.SUCCESS }, { path: FlowchartStepResultsEnum.ERROR }],
  },
  {
    type: FlowchartStepsEnum.STEP_CONDITIONAL,
    pathsResultTypes: [
      { path: FlowchartStepResultsEnum.TRUE },
      { path: FlowchartStepResultsEnum.FALSE, required: true },
    ],
  },
];
