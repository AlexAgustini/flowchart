import { FlowchartStepCoordinates } from '../types/flowchart-step.type';

export class CoordinatesStorageService {
  static setStepCoordinates(
    stepId: string,
    coordinates: FlowchartStepCoordinates
  ) {
    localStorage.setItem(stepId, JSON.stringify(coordinates));
  }

  static getStepCoordinates(stepId: string) {
    return JSON.parse(localStorage.getItem(stepId));
  }
}
