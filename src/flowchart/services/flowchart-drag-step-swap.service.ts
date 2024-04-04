import { Injectable } from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { FlowchartRendererService } from './flowchart-renderer.service';
import { FlowchartStepsEnum } from '../enums/flowchart-steps.enum';
import { FlowchartConstants } from '../helpers/flowchart-constants';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class FlowchartDragStepSwapService {
  /**
   */
  public currentStepTreeBeingSwapped: FlowchartStepComponent;
  /**
   */
  public currentStepTreeBeingSwappedOriginParent: FlowchartStepComponent;

  public isSwapModeActive: boolean;

  constructor(private flowchartRendererService: FlowchartRendererService) {}

  /**
   *
   */
  public toggleSwapMode(): void {
    this.isSwapModeActive = !this.isSwapModeActive;
  }

  public onFlowchartDragEnd(e: CdkDragEnd, step: FlowchartStepComponent) {
    const { layerX: mouseX, layerY: mouseY } = e.event as any;

    const dropareas = this.flowchartRendererService.steps.filter(
      (step) => step.type == FlowchartStepsEnum.STEP_DROPAREA
    );

    const droppedAboveDroparea = dropareas.find((droparea) => {
      const dropareaCoords = droparea.getCoordinates();

      return (
        mouseX > dropareaCoords.x &&
        mouseX < dropareaCoords.x + dropareaCoords.width &&
        mouseY > dropareaCoords.y &&
        mouseY < dropareaCoords.y + dropareaCoords.height
      );
    });

    if (droppedAboveDroparea) {
      droppedAboveDroparea.removeSelf();

      this.currentStepTreeBeingSwappedOriginParent.children.splice(
        this.currentStepTreeBeingSwapped.children.findIndex((child) => child.id == this.currentStepTreeBeingSwapped.id),
        1
      );
      droppedAboveDroparea.parent.children.push(this.currentStepTreeBeingSwapped);
      this.currentStepTreeBeingSwapped.parent = droppedAboveDroparea.parent;
    } else {
      this.currentStepTreeBeingSwapped.parent = this.currentStepTreeBeingSwappedOriginParent;
    }

    this.flowchartRendererService.steps.forEach((step) => step.toggleDragMode());
    this.flowchartRendererService.render();
  }
}
