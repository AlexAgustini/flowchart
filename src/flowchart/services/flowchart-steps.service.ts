import { FlowchartConstants } from '../helpers/flowchart-constants';
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
import { stepsObj } from '../helpers/flowchart-steps-registry';
import { FlowchartStepsDataType } from '../helpers/flowchart-steps-data-type';
import { FlowchartStepsEnum } from '../helpers/flowchart-steps.enum';

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
   * Cria step
   * @param pendingStep Step a ser criado
   * @param parentStep Step pai do step a ser criado
   * @param asSibling Se o step que será criado deve ser criado como irmão dos steps children atuais do parentStep - default false
   * @param asPlaceholder Se deve ser criado em modo de placeholder - default false
   */
  public createStep<T extends FlowchartStepsDataType = FlowchartStepsDataType>({
    pendingStep,
    parentStep,
    asSibling = false,
    asPlaceholder = false,
  }: {
    pendingStep: FlowchartStepComponent<T> | FlowchartStep<T>;
    parentStep?: FlowchartStepComponent;
    asSibling?: boolean;
    asPlaceholder?: boolean;
  }): FlowchartStepComponent<T> {
    if (!pendingStep) return;
    const compRef: ComponentRef<FlowchartStepComponent<T>> =
      this.flowchartViewContainer.createComponent(
        stepsObj.find((step) => step.type == pendingStep.type).component
      );

    this.flowchartService.addStep(compRef.instance);

    this.setStepData({
      pendingStep,
      compRef,
      parentStep,
      asSibling,
      asPlaceholder,
    });

    pendingStep.children?.forEach((child: FlowchartStepComponent<T>) => {
      this.createStep({
        pendingStep: child,
        parentStep: compRef.instance,
        asPlaceholder,
      });
    });

    return compRef.instance;
  }

  /**
   * Seta inputs e configurações dos steps após criação
   * @param pendingStep Step a ser criado
   * @param compRef Referência ao ComponentRef do componente criado
   * @param parentStep Step pai do step a ser criado
   * @param asSibling Se o step que será criado deve ser criado como irmão dos steps children atuais do parentStep - default false
   * @param asPlaceholder Se deve ser criado em modo de placeholder - default false
   */
  private setStepData({
    pendingStep,
    compRef,
    parentStep,
    asSibling,
    asPlaceholder,
  }: {
    pendingStep: FlowchartStepComponent | FlowchartStep;
    compRef: ComponentRef<FlowchartStepComponent>;
    parentStep?: FlowchartStepComponent;
    asSibling: boolean;
    asPlaceholder: boolean;
  }) {
    compRef.instance.id = pendingStep.id ?? this.generateRandomId();
    compRef.instance.data = pendingStep.data;
    compRef.instance.compRef = compRef;
    compRef.instance.parent = parentStep;
    compRef.instance.type = pendingStep.type;

    this.setStepParentChildrenRelation({
      newStep: compRef.instance,
      parentStep,
      asSibling,
    });

    compRef.instance.afterStepRender = this.afterStepRender;
    compRef.instance.afterStepDestroy = this.afterStepDestroy;

    if (asPlaceholder) {
      compRef.instance.isPlaceholder = true;
    }
    compRef.changeDetectorRef.detectChanges();
  }

  /**
   * Faz tratamento de relações hierárquicas parent/children após criação de step
   * @param compRef Referência ao ComponentRef do componente criado
   * @param parentStep Step pai do step a ser criado
   * @param asSibling Se o step que será criado deve ser criado como irmão dos steps children atuais do parentStep - default false
   */
  private setStepParentChildrenRelation({
    newStep,
    parentStep,
    asSibling,
  }: {
    newStep: FlowchartStepComponent;
    parentStep?: FlowchartStepComponent;
    asSibling: boolean;
  }) {
    if (!parentStep) return;
    if (!asSibling) {
      parentStep.children.forEach((child) => (child.parent = newStep));

      newStep.children = parentStep.children;
      parentStep.children = [];

      newStep.children.forEach((child) =>
        this.removeConnector(parentStep.id, child.id)
      );
    }

    if (parentStep) {
      parentStep.children.push(newStep);
    }
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
    recursive?: boolean
  ) => {
    if (recursive) {
      if (destroyedStep.parent) destroyedStep.parent.children = [];
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

    this.removeConnector(destroyedStep.parent?.id, destroyedStep.id);

    destroyedStep.children.forEach((child) => {
      this.removeConnector(destroyedStep.id, child.id);

      child.moveSelfAndAllChildren({
        x: 0,
        y: -(
          destroyedStepCoordinates.height +
          FlowchartConstants.FLOWCHART_STEPS_GAP
        ),
      });
    });

    this.flowchartService.removeStep(destroyedStep);
  };

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
    if (step.type == FlowchartStepsEnum.STEP_INITIAL) {
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
