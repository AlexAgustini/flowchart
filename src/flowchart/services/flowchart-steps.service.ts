import {
  ComponentRef,
  ElementRef,
  Injectable,
  ViewContainerRef,
} from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import {
  FlowchartStep,
  FlowchartStepCoordinates,
} from '../types/flowchart-step.type';
import { FlowchartConstants } from '../helpers/flowchart-constants.enum';
import { FlowchartService } from './flowchart.service';
import { ConnectorsService } from './connectors.service';
import { CoordinatesStorageService } from './coordinates-storage.service';
import { stepsObj } from '../helpers/flowchart-steps-registry';

@Injectable({
  providedIn: 'root',
})
export class FlowchartStepsService {
  /**
   * ViewContainer do {@link FlowchartComponent}
   */
  private flowchartViewContainer!: ViewContainerRef;

  constructor(
    private flowchartService: FlowchartService,
    private connectorsService: ConnectorsService
  ) {}

  public registerFlowchartContainer(flowchartViewContainer: ViewContainerRef) {
    this.flowchartViewContainer = flowchartViewContainer;
  }

  /**
   * Cria step dinamicamente
   * @param pendingComponent Componente dinâmico a ser criado
   * @param parentStep Step pai do step a ser criado
   */
  public createStep({
    pendingStep,
    parentStep,
    asSibling = true,
  }: {
    pendingStep: FlowchartStep;
    parentStep?: FlowchartStepComponent;
    asSibling?: boolean;
  }): FlowchartStepComponent {
    const compRef: ComponentRef<FlowchartStepComponent> =
      this.flowchartViewContainer.createComponent(
        stepsObj.find((step) => step.type == pendingStep.type).component
      );

    this.setStepData({
      pendingStep,
      compRef,
      parentStep,
      asSibling,
    });

    this.flowchartService.addStep(compRef.instance);

    pendingStep.children?.forEach((child) =>
      this.createStep({ pendingStep: child, parentStep: compRef.instance })
    );

    return compRef.instance;
  }

  /**
   * Callbacks a serem realizados após renderização do step
   * @param step Step renderizado
   */
  private afterStepRender = (step: FlowchartStepComponent) => {
    this.setStepInitialCoordinates(step);
    this.drawConnectors(step);
    this.drawConnectors(step.parent);
  };

  /**
   * Callbacks a serem realizados após destruição do step
   * @param step Step destruído
   */
  private afterStepDestroy = (
    destroyedStep: FlowchartStepComponent,
    recursive?: boolean
  ) => {
    if (recursive) {
      destroyedStep.parent.children = [];
    } else {
      destroyedStep.children?.forEach((child) => {
        child.parent = destroyedStep.parent;
      });

      destroyedStep.parent.children.splice(
        destroyedStep.parent.children.findIndex(
          (child) => child.id == destroyedStep.id
        ),
        1
      );
      destroyedStep.parent.children.push(...destroyedStep.children);
    }

    this.clearDestroyedStepConnectors(destroyedStep);
    this.drawConnectors(destroyedStep.parent);

    this.flowchartService.removeStep(destroyedStep);
  };

  private setStepData({
    pendingStep,
    compRef,
    parentStep,
    asSibling = true,
  }: {
    pendingStep: FlowchartStep;
    compRef: ComponentRef<FlowchartStepComponent>;
    parentStep?: FlowchartStepComponent;
    asSibling: boolean;
  }) {
    compRef.setInput('id', pendingStep.id ?? this.generateRandomId());
    compRef.setInput('compRef', compRef);
    compRef.setInput('parent', parentStep);
    compRef.setInput('type', pendingStep.type);

    this.setStepHierarchicalLogic({ compRef, parentStep, asSibling });

    compRef.setInput('afterStepRender', this.afterStepRender);
    compRef.setInput('afterStepDestroy', this.afterStepDestroy);
    compRef.changeDetectorRef.detectChanges();
  }

  private setStepHierarchicalLogic({
    compRef,
    parentStep,
    asSibling = true,
  }: {
    compRef: ComponentRef<FlowchartStepComponent>;
    parentStep?: FlowchartStepComponent;
    asSibling: boolean;
  }) {
    const stepInstance = compRef.instance;

    if (!asSibling) {
      parentStep.children.forEach((child) => (child.parent = stepInstance));

      stepInstance.children = parentStep.children.splice(
        0,
        parentStep.children.length
      );

      this.removeConnector(parentStep.id, stepInstance.children[0]?.id);
    }

    if (parentStep) {
      parentStep.children.push(stepInstance);
    }
  }

  /**
   * Desenha flechas que conectam os steps
   */
  private drawConnectors(step: FlowchartStepComponent): void {
    this.connectorsService.drawConnectors(step);
  }

  /**
   * Limpa conectores antigos, caso não existam mais
   */
  private clearDestroyedStepConnectors(step: FlowchartStepComponent): void {
    this.connectorsService.clearDestroyedStepConnectors(step);
  }

  /**
   * Limpa conectores antigos, caso não existam mais
   */
  private removeConnector(parentId: string, childId: string): void {
    this.connectorsService.removeConnector(parentId, childId);
  }

  /**
   * Seta coordenadas iniciais do step
   * @param step
   */
  private setStepInitialCoordinates(step: FlowchartStepComponent) {
    let stepCoordinates = CoordinatesStorageService.getStepCoordinates(step.id);
    if (!stepCoordinates)
      stepCoordinates = this.getStepDefaultCoordinates(step);

    step.setCoordinates(stepCoordinates);
  }

  /**
   * Retorna coordenadas default de um step calculadas com base nas coordenadas do pai, no caso deste não ter coordenadas pré-setadas
   */
  private getStepDefaultCoordinates(
    step: FlowchartStepComponent
  ): FlowchartStepCoordinates {
    if (!step.parent) return;
    const parentStepCoordinates = step.parent.getCoordinates();

    const parentStepCenter =
      parentStepCoordinates.x + parentStepCoordinates.width / 2;
    const stepCoordinates = step.getCoordinates();

    return {
      x: parentStepCenter - stepCoordinates.width / 2,
      y:
        parentStepCoordinates.y +
        stepCoordinates.height +
        FlowchartConstants.FLOWCHART_STEPS_GAP,
    };
  }

  private generateRandomId(): string {
    return 's' + Date.now();
  }
}
