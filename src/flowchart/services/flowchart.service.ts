import {
  Flow,
  FlowchartStep,
  FlowchartStepCoordinates,
} from './../types/flowchart-step.type';
import { FlowchartComponent } from './../flowchart.component';
import {
  Injectable,
  ViewContainerRef,
  ComponentRef,
  ElementRef,
} from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { Point } from '@angular/cdk/drag-drop';
import { stepsMap } from '../helpers/flowchart-steps-registry';
import { FlowchartConstants } from '../helpers/flowchart-constants.enum';
import { ConnectorsService } from './connectors.service';

@Injectable({
  providedIn: 'root',
})
export class FlowchartService {
  public flow: Flow;
  /**
   * ViewContainer do {@link FlowchartComponent}
   */
  private flowchartViewContainer!: ViewContainerRef;
  /**
   * ElementRef do {@link FlowchartComponent}
   */
  private flowchartElement!: ElementRef<HTMLElement>;

  constructor(private connectorsService: ConnectorsService) {}

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
        stepsMap.get(pendingStep.STEP_NAME)
      );

    this.setStepData({
      pendingStep,
      compRef,
      parentStep,
      asSibling,
    });

    this.flow.steps.push(compRef.instance);

    return compRef.instance;
  }

  /**
   *Inicia construção do chart por um bloco inicial
   * @param initialStep Bloco inicial
   */
  public initFlowchart(initialStep: FlowchartStep) {
    this.flow = {
      initialStep: null,
      steps: [],
    };

    const flowchartStep = this.createStep({ pendingStep: initialStep });

    this.flow.initialStep = flowchartStep;

    initialStep?.children?.forEach((child) => {
      this.createStep({ pendingStep: child, parentStep: flowchartStep });
    });
  }

  /**
   * Registra referências ao flowchartContainer
   * @param viewContainerRef
   * @param elementRef
   */
  public registerFlowchart(
    viewContainerRef: ViewContainerRef,
    elementRef: ElementRef
  ): void {
    this.flowchartViewContainer = viewContainerRef;
    this.flowchartElement = elementRef;
    this.createFlowchartContent();
  }

  /**
   * Calcula coordenadas coordenadas de um ponto XY relativos à tela e os retorna relativos ao elemento do flowchart
   * @param point Ponto a ser calculado
   */
  public getPointXYRelativeToFlowchart(point: Point): Point {
    return {
      x: point.x - this.flowchartBoundingRect.x,
      y: point.y - this.flowchartBoundingRect.y,
    };
  }

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
    const stepInstance = compRef.instance;

    if (!asSibling && parentStep.children?.length > 0) {
      parentStep.children.forEach((child) => (child.parent = stepInstance));

      stepInstance.children = parentStep.children.splice(
        0,
        parentStep.children.length
      );

      this.clearStepOldConnectors(parentStep);
    }

    if (parentStep) {
      parentStep.children.push(stepInstance);
    }

    compRef.setInput('compRef', compRef);
    compRef.setInput('parent', parentStep);
    compRef.setInput('coordinates', pendingStep.coordinates);
    compRef.setInput('afterStepRender', this.afterStepRender);
    compRef.setInput('afterStepDestroy', this.afterStepDestroy);
    compRef.setInput('id', pendingStep.id ?? this.generateRandomId());
    compRef.changeDetectorRef.detectChanges();
  }

  /**
   * Callbacks a serem realizados após renderização do step
   * @param step Step renderizado
   */
  private afterStepRender = (step: FlowchartStepComponent) => {
    this.setStepInitialCoordinates(step);
    this.setChildrenDefaultGap(step);
    this.drawStepConnectors(step);
    this.drawStepConnectors(step.parent);
  };

  /**
   * Callbacks a serem realizados após destruição do step
   * @param step Step destruído
   */
  private afterStepDestroy = (
    destroyedStep: FlowchartStepComponent,
    recursive?: boolean
  ) => {
    destroyedStep.children?.forEach((child) => {
      child.parent = destroyedStep.parent;
    });

    if (destroyedStep.children.length == 1) {
      destroyedStep.children[0].setCoordinates(destroyedStep.getCoordinates());
    }

    destroyedStep.parent.children.splice(
      destroyedStep.parent.children.findIndex(
        (child) => child.id == destroyedStep.id
      ),
      1
    );
    destroyedStep.parent.children.push(...destroyedStep.children);

    if (recursive) {
      destroyedStep.parent.children = [];
    }

    this.clearStepOldConnectors(destroyedStep);
    this.drawStepConnectors(destroyedStep.parent);
  };

  /**
   * Desenha flechas que conectam os steps
   */
  private drawStepConnectors(step: FlowchartStepComponent): void {
    this.connectorsService.drawConnectors(step);
  }

  /**
   * Limpa conectores antigos, caso não existam mais
   */
  private clearStepOldConnectors(step: FlowchartStepComponent): void {
    this.connectorsService.clearAllOldConnectors(step);
  }

  /**
   * Seta coordenadas iniciais do step
   * @param step
   */
  private setStepInitialCoordinates(step: FlowchartStepComponent) {
    let stepCoordinates = step.coordinates;
    if (!stepCoordinates)
      stepCoordinates = this.getStepDefaultCoordinates(step);

    step.setCoordinates(stepCoordinates);
  }

  private setChildrenDefaultGap(step: FlowchartStepComponent) {
    const stepCoordinates = step.getCoordinates();
    step.children.forEach((child) => {
      const childCoordinates = child.getCoordinates();

      const yDiff = childCoordinates.y - stepCoordinates.y;
      console.log(yDiff);

      if (yDiff < FlowchartConstants.FLOWCHART_STEPS_GAP) {
        child.setCoordinates({
          x: childCoordinates.x,
          y:
            childCoordinates.y +
            Math.abs(yDiff) +
            FlowchartConstants.FLOWCHART_STEPS_GAP,
        });
      }
    });
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

  /**
   * Retorna bloco raíz do fluxo
   */
  public getRootBlock(): FlowchartStepComponent {
    return this.flow.initialStep;
  }

  /**
   * Retorna elemento nativo do flowchart
   */
  public get flowchartEl() {
    return this.flowchartElement.nativeElement;
  }

  /**
   * Retorna dimensões do flowchart
   */
  public get flowchartBoundingRect() {
    return this.flowchartEl.getBoundingClientRect();
  }

  private generateRandomId(): string {
    return 's' + Date.now();
  }

  private createFlowchartContent() {
    // const bottomGap = document.createElement('div');
    // bottomGap.classList.add(FlowchartConstantsEnum.FLOWCHART_BOTTOM_GAP);
    // bottomGap.style.top = `${this.flowchartEl.offsetHeight}px`;
    // bottomGap.style.height = `${
    //   FlowchartConstantsEnum.FLOWCHART_STEPS_GAP * 2
    // }px`;
    // this.flowchartEl.appendChild(bottomGap);
    // console.log(this.flowchartEl.offsetHeight);
    // this.flowchartEl;
  }
}
