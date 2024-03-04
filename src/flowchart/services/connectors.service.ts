import { Injectable } from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';

@Injectable({
  providedIn: 'root',
})
export class ConnectorsService {
  drawConnectors(step: FlowchartStepComponent) {}
}
