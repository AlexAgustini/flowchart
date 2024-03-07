import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { Point } from '@angular/cdk/drag-drop';
import { FlowBlockTypes } from '../helpers/flowchart-steps-registry';

export type Flow = {
  initialStep: FlowchartStepComponent;
  steps: Array<FlowchartStepComponent>;
};

export type FlowchartStep = {
  id?: string;

  STEP_NAME: FlowBlockTypes;
  canDropAnywhere?: boolean;
  data?: any;
  children?: Array<FlowchartStep>;
  parent?: FlowchartStepComponent;
  coordinates?: FlowchartStepCoordinates;
  connectors?: Array<FlowchartStepConnector>;
};

export type FlowchartStepConnector = {
  childId: string;
  path: SVGPathElement;
};

export type FlowchartStepCoordinates = Point & {
  width?: number;
  height?: number;
};
