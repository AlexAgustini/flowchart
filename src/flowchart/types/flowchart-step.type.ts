import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { Point } from '@angular/cdk/drag-drop';

export type FlowchartStep = {
  id?: string;
  STEP_NAME: string;
  canDropAnywhere?: boolean;
  data?: any;
  children?: Array<FlowchartStep>;
  parent?: FlowchartStepComponent;
  coordinates?: FlowchartStepCoordinates;
};

export type FlowchartStepCoordinates = Point & {
  width?: number;
  height?: number;
};
