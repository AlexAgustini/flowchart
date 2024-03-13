import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { Point } from '@angular/cdk/drag-drop';
import { FlowBlocksEnum } from '../helpers/flowchart-steps-registry';

export type Flow = {
  steps?: Array<FlowchartStepComponent>;
  connectors?: Array<FlowchartStepConnector>;
};

export type FlowchartStep = {
  id?: string;
  type: FlowBlocksEnum;
  canDropAnywhere?: boolean;
  data?: any;
  children?: Array<FlowchartStep>;
  parent?: FlowchartStepComponent;
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
