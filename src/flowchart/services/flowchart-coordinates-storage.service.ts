import { FlowchartStepCoordinates } from '../types/flowchart-step.type';

export abstract class FlowchartCoordinatesStorageService {
  static setStepCoordinates(stepId: string, coordinates: FlowchartStepCoordinates) {
    localStorage.setItem(stepId, JSON.stringify(coordinates));
  }

  static getStepCoordinates(stepId: string): FlowchartStepCoordinates {
    return JSON.parse(localStorage.getItem(stepId));
  }
}
