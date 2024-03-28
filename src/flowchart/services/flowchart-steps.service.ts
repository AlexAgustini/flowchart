import { FlowchartConstants } from '../helpers/flowchart-constants';
import { ComponentRef, ElementRef, Injectable, ViewContainerRef } from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { FlowchartStep, FlowchartStepCoordinates } from '../types/flowchart-step.type';
import { FlowchartRendererService } from './flowchart-renderer.service';
import { FlowchartConnectorsService } from './flowchart-connectors.service';
import { FlowchartCoordinatesStorageService } from './flowchart-coordinates-storage.service';
import { stepsObj } from '../helpers/flowchart-steps-registry';
import { FlowchartStepsDataType } from '../types/flowchart-steps-data-type';
import { FlowchartStepsEnum } from '../enums/flowchart-steps.enum';
import { FlowchartStepsConfiguration } from '../helpers/flowchart-steps-configurations';

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

  /**
   * Serviço renderer do Flowchart
   */
  private readonly flowchartRendererService: FlowchartRendererService;

  /**
   * Serviço de conectores do Flowchart
   */
  private readonly connectorsService: FlowchartConnectorsService;

  constructor(flowchartRendererService: FlowchartRendererService, connectorsService: FlowchartConnectorsService) {
    this.flowchartRendererService = flowchartRendererService;
    this.connectorsService = connectorsService;
  }

  public registerFlowchart(flowchartViewContainer: ViewContainerRef, flowchartElement: ElementRef<HTMLElement>) {
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
  public async createStep<T extends FlowchartStepsDataType = FlowchartStepsDataType>({
    pendingStep,
    parentStep,
    asSibling = false,
    asPlaceholder = false,
  }: {
    pendingStep: FlowchartStepComponent<T> | FlowchartStep<T>;
    parentStep?: FlowchartStepComponent;
    asSibling?: boolean;
    asPlaceholder?: boolean;
  }): Promise<FlowchartStepComponent<T>> {
    if (!pendingStep) return;

    // Intervalo base para criação de steps
    await new Promise((resolve) => setTimeout(() => resolve(true), 0));
    const compRef: ComponentRef<FlowchartStepComponent<T>> = this.flowchartViewContainer.createComponent(
      stepsObj.find((step) => step.type == pendingStep.type).component
    );

    await this.setStepData({
      pendingStep,
      compRef,
      parentStep,
      asSibling,
      asPlaceholder,
    });

    // Get step pre-configured pathsResults
    const createdStepPathsResults = FlowchartStepsConfiguration.find(
      (stepPath) => stepPath.stepType == compRef.instance.type
    );

    // If there are no pathsResults configured, just continue creating the children steps without creating a stepResult
    if (!createdStepPathsResults) {
      pendingStep.children?.forEach((child: FlowchartStep) => {
        this.createStep({ pendingStep: child, parentStep: compRef.instance, asPlaceholder });
      });

      compRef.instance.afterChildrenInit?.();

      return compRef.instance;
    }

    createdStepPathsResults.stepResults.forEach(async (pathResult, i) => {
      const shouldCreateStepResult = i == 0 || pathResult.required || pendingStep.children?.[i];
      if (!shouldCreateStepResult) return;

      const stepResult = await this.createStep({
        pendingStep: { type: FlowchartStepsEnum.STEP_RESULT, data: { resultType: pathResult.path } },
        parentStep: compRef.instance,
        asPlaceholder,
        asSibling: i > 0,
      });

      if (pendingStep.children?.[i]) {
        this.createStep({ pendingStep: pendingStep.children[i], parentStep: stepResult, asPlaceholder });
      }
    });

    compRef.instance.afterChildrenInit?.();
    return compRef.instance;
  }

  /**
   * Cria step
   * @param pendingStep Step a ser criado
   * @param parentStep Step pai do step a ser criado
   * @param asSibling Se o step que será criado deve ser criado como irmão dos steps children atuais do parentStep - default false
   * @param asPlaceholder Se deve ser criado em modo de placeholder - default false
   */
  public async createStepWithoutStepResults<T extends FlowchartStepsDataType = FlowchartStepsDataType>({
    pendingStep,
    parentStep,
    asSibling = false,
    asPlaceholder = false,
  }: {
    pendingStep: FlowchartStepComponent<T> | FlowchartStep<T>;
    parentStep?: FlowchartStepComponent;
    asSibling?: boolean;
    asPlaceholder?: boolean;
  }): Promise<FlowchartStepComponent<T>> {
    if (!pendingStep) return;

    // Intervalo base para criação de steps
    await new Promise((resolve) => setTimeout(() => resolve(true), 50));
    const compRef: ComponentRef<FlowchartStepComponent<T>> = this.flowchartViewContainer.createComponent(
      stepsObj.find((step) => step.type == pendingStep.type).component
    );

    await this.setStepData({
      pendingStep,
      compRef,
      parentStep,
      asSibling,
      asPlaceholder,
    });

    for (const [i, child] of pendingStep.children.entries()) {
      this.createStepWithoutStepResults({
        pendingStep: child,
        parentStep: compRef.instance,
        asSibling: i > 0,
        asPlaceholder,
      });
    }

    return compRef.instance;
  }

  stepclone: FlowchartStepComponent;

  /**
   * Seta inputs e configurações dos steps após criação
   * @param pendingStep Step a ser criado
   * @param compRef Referência ao ComponentRef do componente criado
   * @param parentStep Step pai do step a ser criado
   * @param asSibling Se o step que será criado deve ser criado como irmão dos steps children atuais do parentStep - default false
   * @param asPlaceholder Se deve ser criado em modo de placeholder - default false
   */
  private async setStepData({
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
  }): Promise<void> {
    this.flowchartRendererService.addStep(compRef.instance);
    compRef.instance.id = pendingStep.id ?? this.generateRandomId();
    compRef.instance.data = pendingStep.data;
    compRef.instance.compRef = compRef;
    compRef.instance.parent = parentStep;
    compRef.instance.type = pendingStep.type;
    compRef.instance.isPlaceholder = asPlaceholder;
    compRef.instance.afterStepRender = this.afterStepRender;
    if (!compRef.instance.afterStepDestroy) {
      compRef.instance.afterStepDestroy = this.afterStepDestroy;
    }

    this.setStepParentChildrenRelation({
      newStep: compRef.instance,
      parentStep,
      asSibling,
    });

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
      parentStep.children.forEach((child) => {
        // Change parent
        child.parent = newStep;
        // Push ex-parent children to new parent children
        newStep.children.push(child);
        // Removes old connectors between parent and children
        this.removeConnector(parentStep.id, child.id);
      });

      // Empty parent children
      parentStep.children = [];
    }

    if (parentStep) {
      parentStep.children.push(newStep);
    }
  }

  /**
   * Callbacks a serem realizados após renderização do step
   * @param step Step renderizado
   */
  private afterStepRender = (step: FlowchartStepComponent): void => {
    this.setStepInitialCoordinates(step);
  };

  /**
   * Callbacks a serem realizados após destruição do step
   * @param step Step destruído
   */
  private afterStepDestroy = (
    destroyedStep: FlowchartStepComponent,
    destroyedStepCoordinates: FlowchartStepCoordinates,
    recursive?: boolean
  ): void => {
    const destroyedStepParent = destroyedStep.parent;

    // Seta novo pai dos filhos do step destruído
    destroyedStep.children?.forEach((child) => {
      child.parent = destroyedStep.parent;
    });

    // Remove step destruído do array de children do pai
    destroyedStepParent.children.splice(
      destroyedStepParent.children.findIndex((child) => child.id == destroyedStep.id),
      1
    );

    // Passa filhos do step destruído para o pai
    destroyedStepParent.children.push(...destroyedStep.children);

    // Move todos steps filhos para cima no eixo Y correspondente à altura do step destruído
    destroyedStep.children.forEach((child) => {
      this.removeConnector(destroyedStep.id, child.id);

      child.moveSelfAndAllChildren({
        x: 0,
        y: -(destroyedStepCoordinates.height + FlowchartConstants.FLOWCHART_STEPS_GAP),
      });
    });

    // Remove stepResults(caso não seja remoção recursiva)
    if (!recursive) {
      const stepResults = destroyedStep.children.filter(
        (child) => child.type == FlowchartStepsEnum.STEP_RESULT && !child.isPlaceholder
      );

      stepResults.forEach((step) => step.removeSelf());
    }

    // Remove conector entre o step destruído e o pai
    this.removeConnector(destroyedStepParent?.id, destroyedStep.id);

    // Remove step do array de steps totais do fluxo
    this.flowchartRendererService.removeStep(destroyedStep);
  };

  /**
   * Limpa conectores
   */
  public removeConnector(parentId: string, childId: string): void {
    this.connectorsService.removeConnector(parentId, childId);
  }

  /**
   * Seta coordenadas iniciais do step
   * @param step
   */
  public setStepInitialCoordinates(step: FlowchartStepComponent, increaseHeight?: boolean): void {
    if (step.type == FlowchartStepsEnum.STEP_INITIAL) {
      step.setCoordinates({
        x: this.flowchartElement.nativeElement.scrollWidth / 2 - step.getCoordinates().width / 2,
        y: 0,
      });
      return;
    }
    const stepCoordinates = FlowchartCoordinatesStorageService.getStepCoordinates(step.id);

    if (stepCoordinates) {
      step.setCoordinates(stepCoordinates);
    } else {
      this.setStepCoordinates(step, increaseHeight);
    }
  }

  /**
   * Calcula coordenadas de um novo step
   */
  private setStepCoordinates(newStep: FlowchartStepComponent, increaseHeight = true): void {
    if (!newStep?.parent) return;

    const parentCoordinates = newStep.parent.getCoordinates();
    const parentXCenter = parentCoordinates.x + parentCoordinates.width / 2;
    const siblings = newStep.getSiblings();

    if (siblings.length) {
      this.setSiblingStepsCoordinates(newStep, siblings, parentCoordinates, parentXCenter);
    } else {
      const newStepDimensions = newStep.getCoordinates();
      newStep.setCoordinates({
        x: parentXCenter - newStepDimensions.width / 2,
        y: parentCoordinates.y + parentCoordinates.height + FlowchartConstants.FLOWCHART_STEPS_GAP,
      });

      // Caso o step esteja sendo inserido no meio de outros dois steps, é necessário jogar os steps subsequentes para baixo
      if (newStep.children.length && increaseHeight) {
        newStep.children
          .filter((step) => step.type !== FlowchartStepsEnum.STEP_RESULT)
          .forEach((child) =>
            child.moveSelfAndAllChildren({
              x: 0,
              y: newStepDimensions.height + FlowchartConstants.FLOWCHART_STEPS_GAP,
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
    const noSiblingHasBeenDragged = siblings.every((sibling) => !sibling.hasBeenDragged());

    if (noSiblingHasBeenDragged) {
      this.setUndraggedSiblingStepsCoordinates([...siblings, newStep], parentCoordinates, parentXCenter);
    } else {
      this.setDraggedSiblingStepsCoordinates(newStep, siblings, parentCoordinates);
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
    const previousPositions = siblings.map((sibling) => sibling.getCoordinates());

    const isOdd = siblings.length % 2 !== 0;
    const leftSteps = isOdd ? siblings.slice(0, (siblings.length - 1) / 2) : siblings.slice(0, siblings.length / 2);
    const rightSteps = isOdd
      ? siblings.slice((siblings.length + 1) / 2, siblings.length)
      : siblings.slice(siblings.length / 2, siblings.length);

    const leftStepsTotalWidth = leftSteps
      .map((step) => step.getCoordinates().width)
      .reduce((acc, curr) => acc + curr, 0);

    const leftXStart =
      parentCoordinates.x - leftStepsTotalWidth - FlowchartConstants.FLOWCHART_STEPS_GAP * leftSteps.length;
    const rightXStart = parentCoordinates.x + parentCoordinates.width + FlowchartConstants.FLOWCHART_STEPS_GAP;

    function setPositions(xStart: number, steps: Array<FlowchartStepComponent>) {
      const positions = [xStart];

      steps.forEach((step, i) => {
        let currentXPosition = positions[positions.length - 1];
        const previousStep = leftSteps[i - 1];

        if (i > 0) {
          currentXPosition += previousStep.getCoordinates().width + FlowchartConstants.FLOWCHART_STEPS_GAP;
          positions.push(currentXPosition);
        }

        step.setCoordinates({
          x: currentXPosition,
          y: parentCoordinates.y + parentCoordinates.height + Number(FlowchartConstants.FLOWCHART_STEPS_GAP),
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
        y: parentCoordinates.y + centerStepCoordinates.height + FlowchartConstants.FLOWCHART_STEPS_GAP,
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
      x: greaterXSiblingCoordinates.x + greaterXSiblingCoordinates.width + FlowchartConstants.FLOWCHART_STEPS_GAP,
      y: parentCoordinates.y + parentCoordinates.height + FlowchartConstants.FLOWCHART_STEPS_GAP,
    });
  }

  public generateRandomId(): string {
    return 's' + Date.now();
  }
}
