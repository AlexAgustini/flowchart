import { Flow, FlowchartStepConnector } from './../types/flowchart-step.type';
import { Injectable } from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';

@Injectable({
  providedIn: 'root',
})
export class FlowchartService {
  public flow: Flow = {
    initialStep: null,
    steps: [],
    connectors: [],
  };

  public addStep(step: FlowchartStepComponent) {
    this.steps.push(step);
  }

  public removeStep(step: FlowchartStepComponent) {
    this.steps.splice(this.flow.steps.findIndex((s) => s.id == step.id));
  }

  public addConnector(connector: FlowchartStepConnector) {
    this.connectors.push(connector);
  }

  public removeConnector(connector: FlowchartStepConnector) {
    const connectorIndex = this.connectors.findIndex(
      (c) => c.parentId == connector.parentId && c.childId == connector.childId
    );

    this.flow.connectors.splice(connectorIndex, 1);
  }

  public get connectors() {
    return this.flow.connectors;
  }

  public get steps() {
    return this.flow.steps;
  }

  /**
   * Retorna bloco raíz do fluxo
   */
  public getRootBlock(): FlowchartStepComponent {
    return this.flow.initialStep;
  }
}
