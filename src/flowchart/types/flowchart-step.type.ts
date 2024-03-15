import { FlowchartStepsDataType } from './../helpers/flowchart-steps-data-type';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { Point } from '@angular/cdk/drag-drop';
import { FlowchartStepsEnum } from '../helpers/flowchart-steps.enum';

export type Flow = {
  steps?: Array<FlowchartStepComponent>;
  connectors?: Array<FlowchartStepConnector>;
};

export type FlowchartStep<
  T extends FlowchartStepsDataType = FlowchartStepsDataType
> = {
  type: FlowchartStepsEnum;
  id?: string;
  canDropAnywhere?: boolean;
  data?: T;
  children?: Array<FlowchartStep>;
  parent?: FlowchartStep;
};

export type FlowchartStepConnector = {
  parentId: string;
  childId: string;
  path: SVGPathElement;
};

export type FlowchartStepCoordinates = Point & {
  width?: number;
  height?: number;
};
