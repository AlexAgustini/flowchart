import { FlowchartConstants } from './../helpers/flowchart-constants.enum';
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
import { FlowchartService } from './flowchart.service';
import { ConnectorsService } from './connectors.service';
import { CoordinatesStorageService } from './coordinates-storage.service';
import { FlowBlocksEnum, stepsObj } from '../helpers/flowchart-steps-registry';
import { Point } from '@angular/cdk/drag-drop';

@Injectable({
  providedIn: 'root',
})
export class FlowchartStepsService {
  /**
   * ViewContainer do {@link FlowchartComponent}
   */
  public flowchartViewContainer!: ViewContainerRef;
  /**
   * ElementRef do {@link FlowchartComponent}
   */
  public flowchartElement!: ElementRef<HTMLElement>;

  constructor(
    private flowchartService: FlowchartService,
    private connectorsService: ConnectorsService
  ) {}

  public registerFlowchart(
    flowchartViewContainer: ViewContainerRef,
    flowchartElement: ElementRef<HTMLElement>
  ) {
    this.flowchartViewContainer = flowchartViewContainer;
    this.flowchartElement = flowchartElement;
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
    this.flowchartService.reCenterFlow();
  };

  /**
   * Callbacks a serem realizados após destruição do step
   * @param step Step destruído
   */
  private afterStepDestroy = (
    destroyedStep: FlowchartStepComponent,
    destroyedStepCoordinates: FlowchartStepCoordinates,
    recursive?: boolean,
    firstRecursion?: boolean
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

    destroyedStep.children.forEach((child) => {
      child.moveSelfAndAllChildren({
        x: 0,
        y: -(
          destroyedStepCoordinates.height +
          FlowchartConstants.FLOWCHART_STEPS_GAP
        ),
      });
    });

    this.flowchartService.removeStep(destroyedStep);

    setTimeout(() => {
      if (!destroyedStep.parent.children.length) {
        if (recursive && !firstRecursion) return;

        destroyedStep.parent.addChild({
          type: FlowBlocksEnum.DROP_AREA,
        });
      }
    }, 0);
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

    this.setStepParentChildrenRelation({ compRef, parentStep, asSibling });

    compRef.setInput('afterStepRender', this.afterStepRender);
    compRef.setInput('afterStepDestroy', this.afterStepDestroy);
    compRef.changeDetectorRef.detectChanges();
  }

  private setStepParentChildrenRelation({
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
    if (step.type == FlowBlocksEnum.INITIAL_STEP) {
      step.setCoordinates({
        x:
          this.flowchartElement.nativeElement.scrollWidth / 2 -
          step.getCoordinates().width / 2,
        y: 0,
      });
      return;
    }
    const stepCoordinates = CoordinatesStorageService.getStepCoordinates(
      step.id
    );

    if (stepCoordinates) {
      step.setCoordinates(stepCoordinates);
    } else {
      this.setStepCoordinates(step);
    }
  }

  /**
   * Calcula coordenadas de um novo step
   */
  private setStepCoordinates(newStep: FlowchartStepComponent): void {
    if (!newStep.parent) return;

    const parentCoordinates = newStep.parent.getCoordinates();
    const parentXCenter = parentCoordinates.x + parentCoordinates.width / 2;
    const siblings = newStep.getSiblings();

    if (siblings.length) {
      this.setSiblingStepsCoordinates(
        newStep,
        siblings,
        parentCoordinates,
        parentXCenter
      );
    } else {
      const newStepDimensions = newStep.getCoordinates();

      newStep.setCoordinates({
        x: parentXCenter - newStepDimensions.width / 2,
        y:
          parentCoordinates.y +
          parentCoordinates.height +
          FlowchartConstants.FLOWCHART_STEPS_GAP,
      });

      // Caso o step esteja sendo inserido no meio de outros dois steps, é necessário jogar os steps subsequentes para baixo
      if (newStep.children.length) {
        newStep.children.forEach((child) =>
          child.moveSelfAndAllChildren({
            x: 0,
            y:
              newStepDimensions.height + FlowchartConstants.FLOWCHART_STEPS_GAP,
          })
        );
      }
    }
  }

  /**
   * Retorna coordenadas default de um step calculadas com base nas coordenadas do pai, no caso deste não ter coordenadas pré-setadas
   * e ter irmãos
   */
  private setSiblingStepsCoordinates(
    newStep: FlowchartStepComponent,
    siblings: Array<FlowchartStepComponent>,
    parentCoordinates: FlowchartStepCoordinates,
    parentXCenter: number
  ): void {
    const noSiblingHasBeenDragged = siblings.every(
      (sibling) => !sibling.hasBeenDragged()
    );

    if (noSiblingHasBeenDragged) {
      this.setUndraggedSiblingStepsCoordinates(
        [...siblings, newStep],
        parentCoordinates,
        parentXCenter
      );
    } else {
      this.setDraggedSiblingStepsCoordinates(
        newStep,
        siblings,
        parentCoordinates
      );
    }
  }

  /**
   * Retorna coordenadas default de um step calculadas com base nas coordenadas do pai, no caso deste não ter coordenadas pré-setadas
   * e ter irmãos que não tiveram sua posição modificada(não foram arrastados)
   */
  private setUndraggedSiblingStepsCoordinates(
    siblings: Array<FlowchartStepComponent>,
    parentCoordinates: FlowchartStepCoordinates,
    parentXCenter: number
  ): void {
    const previousPositions = siblings.map((sibling) =>
      sibling.getCoordinates()
    );

    const isOdd = siblings.length % 2 !== 0;
    const leftSteps = isOdd
      ? siblings.slice(0, (siblings.length - 1) / 2)
      : siblings.slice(0, siblings.length / 2);
    const rightSteps = isOdd
      ? siblings.slice((siblings.length + 1) / 2, siblings.length)
      : siblings.slice(siblings.length / 2, siblings.length);

    const leftStepsTotalWidth = leftSteps
      .map((step) => step.getCoordinates().width)
      .reduce((acc, curr) => acc + curr, 0);

    const leftXStart =
      parentCoordinates.x -
      leftStepsTotalWidth -
      FlowchartConstants.FLOWCHART_STEPS_GAP * leftSteps.length;
    const rightXStart =
      parentCoordinates.x +
      parentCoordinates.width +
      FlowchartConstants.FLOWCHART_STEPS_GAP;

    function setPositions(
      xStart: number,
      steps: Array<FlowchartStepComponent>
    ) {
      const positions = [xStart];

      steps.forEach((step, i) => {
        let currentXPosition = positions[positions.length - 1];
        const previousStep = leftSteps[i - 1];

        if (i > 0) {
          currentXPosition +=
            previousStep.getCoordinates().width +
            FlowchartConstants.FLOWCHART_STEPS_GAP;
          positions.push(currentXPosition);
        }

        step.setCoordinates({
          x: currentXPosition,
          y:
            parentCoordinates.y +
            Number(FlowchartConstants.FLOWCHART_STEPS_GAP) * 2,
        });
      });
    }

    setPositions(leftXStart, leftSteps);
    setPositions(rightXStart, rightSteps);

    if (isOdd) {
      const centerStep = siblings[(siblings.length - 1) / 2 + 1];
      const centerStepCoordinates = centerStep.getCoordinates();
      centerStep.setCoordinates({
        x: parentXCenter - centerStepCoordinates.width / 2,
        y:
          parentCoordinates.y +
          centerStepCoordinates.height +
          FlowchartConstants.FLOWCHART_STEPS_GAP,
      });
    }

    siblings.forEach((sibling, i) => {
      const currentPosition = sibling.getCoordinates();
      const associatedPreviousPosition = previousPositions[i];

      const xDiff = currentPosition.x - associatedPreviousPosition.x;
      const yDiff = currentPosition.y - associatedPreviousPosition.y;

      const readjustChildrenCoordinates = (step: FlowchartStepComponent) => {
        const currCoordinates = step.getCoordinates();
        step.setCoordinates({
          x: currCoordinates.x + xDiff,
          y: currCoordinates.y + yDiff,
        });

        step.children.forEach(readjustChildrenCoordinates);
      };

      sibling.children.forEach(readjustChildrenCoordinates);
    });
  }

  /**
   * Seta coordenadas de um novo filho quando os seus irmãos já foram movimentados
   */
  private setDraggedSiblingStepsCoordinates(
    newStep: FlowchartStepComponent,
    siblings: Array<FlowchartStepComponent>,
    parentCoordinates: FlowchartStepCoordinates
  ): void {
    const greaterXSiblingCoordinates = siblings
      .sort((a, b) => {
        const aCoords = a.getCoordinates();
        const bCoords = b.getCoordinates();

        if (aCoords.x > bCoords.x) {
          return -1;
        }
        return 1;
      })[0]
      .getCoordinates();

    newStep.setCoordinates({
      x:
        greaterXSiblingCoordinates.x +
        greaterXSiblingCoordinates.width +
        FlowchartConstants.FLOWCHART_STEPS_GAP,
      y:
        parentCoordinates.y +
        parentCoordinates.height +
        FlowchartConstants.FLOWCHART_STEPS_GAP,
    });
  }

  public generateRandomId(): string {
    return 's' + Date.now();
  }
}
