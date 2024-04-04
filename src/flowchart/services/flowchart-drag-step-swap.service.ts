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

  /**
   * Observa drag abaixo de steps para criação de steps placeholder
   * @param event
   */
  public onFlowchartDragOver(event: DragEvent): void {
    return;
    const hasStepAbove = this.flowchartRendererService?.steps.find((step) => {
      if (step.type != FlowchartStepsEnum.STEP_RESULT && step.type != FlowchartStepsEnum.STEP_INITIAL) return;

      const stepCoords = step.getCoordinates();

      return (
        event.offsetX > stepCoords.x - FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_WIDTH_THRESHOLD &&
        event.offsetX <
          stepCoords.x + stepCoords.width + FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_WIDTH_THRESHOLD &&
        stepCoords.y + stepCoords.height < event.offsetY &&
        stepCoords.y + stepCoords.height + FlowchartConstants.FLOWCHART_STEP_PLACEHOLDER_CREATION_HEIGHT_THRESHOLD >
          event.offsetY
      );
    });

    if (hasStepAbove) {
      // Caso esteja ná area de drop de um step, mas já tenha placeholder renderizados, retorna
      if (this.flowchartRendererService.hasPlaceholderSteps()) return;

      // const parentStep = this.flowchartRendererService.getStepById(hasStepAbove.id);

      // parentStep.zaddChild({ pendingComponent: this.currentStepTreeBeingSwapped, asPlaceholder: true });
    } else {
      // Se não houverem placeholder steps, retorna
      if (!this.flowchartRendererService.hasPlaceholderSteps()) return;

      // Se estiver ocorrendo drag encima de um droparea, retorna
      // if (this.isDraggingOverDroparea(event)) return;

      // Se estiver em delay de criação de placeholders, retorna (para evitar bugs visuais)
      // if (this.isOnPlaceholderCreationDelay) return;

      // this.removeDropPlaceholders();
    }
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
    } else {
      this.currentStepTreeBeingSwapped.parent = this.currentStepTreeBeingSwappedOriginParent;
    }

    this.flowchartRendererService.steps.forEach((step) => step.toggleDragMode());
    this.flowchartRendererService.render();
  }
}
