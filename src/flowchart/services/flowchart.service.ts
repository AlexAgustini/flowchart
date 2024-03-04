import { FlowchartStep } from './../types/flowchart-step.type';
import { FlowchartComponent } from './../flowchart.component';
import {
  Injectable,
  ViewContainerRef,
  ComponentRef,
  ElementRef,
  ViewRef,
} from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { Point } from '@angular/cdk/drag-drop';
import { FlowchartStepDynamicComponent } from '../components/flowchart-step-dynamic-component/flowchart-step-dynamic.component';

@Injectable({
  providedIn: 'root',
})
export class FlowchartRendererService {
  /**
   * ViewContainer do {@link FlowchartComponent}
   */
  private flowchartViewContainer!: ViewContainerRef;
  /**
   * ElementRef do {@link FlowchartComponent}
   */
  private flowchartElement!: ElementRef<HTMLElement>;

  public registerFlowchart(
    viewContainerRef: ViewContainerRef,
    elementRef: ElementRef
  ) {
    this.flowchartViewContainer = viewContainerRef;
    this.flowchartElement = elementRef;
  }

  /**
   * Cria step dinamicamente
   * @param pendingComponent Componente dinâmico a ser criado
   * @param parentStep Step pai do step a ser criado
   */
  public createStep(
    pendingComponent: FlowchartStep,
    parentStep?: FlowchartStepComponent
  ): FlowchartStepComponent {
    const flowchartStep: ComponentRef<FlowchartStepComponent> =
      this.flowchartViewContainer.createComponent(FlowchartStepComponent);

    this.setStepInputs(flowchartStep, pendingComponent, parentStep);

    return flowchartStep.instance;
  }

  public createStepFromRegistry(
    flowchartStep: FlowchartStep,
    parentStep?: FlowchartStepComponent
  ) {
    const step = this.createStep(
      {
        STEP_NAME: flowchartStep.STEP_NAME,
        data: flowchartStep.data,
        children: flowchartStep.children,
        coordinates: flowchartStep.coordinates,
      },
      parentStep
    );

    if (flowchartStep.children) {
      flowchartStep.children.forEach((child) => {
        this.createStepFromRegistry(child, step);
      });
    }
  }

  public removeStep(hostView: ViewRef) {
    this.flowchartViewContainer.remove(
      this.flowchartViewContainer.indexOf(hostView)
    );
  }

  /**
   *
   * @param initialStep Inicia construção do chart
   */
  public initFlowchart(initialStep?: FlowchartStepDynamicComponent) {
    this.createStepFromRegistry(mock);
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

  public get flowchartEl() {
    return this.flowchartElement.nativeElement;
  }

  public get flowchartBoundingRect() {
    return this.flowchartEl.getBoundingClientRect();
  }

  private generateRandomId(): string {
    return (Math.random() + 1).toString(36).substring(7);
  }

  private setStepInputs(
    flowchartStep: ComponentRef<FlowchartStepComponent>,
    pendingComponent: FlowchartStep,
    parentStep?: FlowchartStepComponent
  ) {
    flowchartStep.setInput('hostView', flowchartStep.hostView);
    flowchartStep.setInput('parent', parentStep);
    flowchartStep.setInput('pendingComponent', pendingComponent);
    flowchartStep.setInput(
      'id',
      pendingComponent.id ?? this.generateRandomId()
    );
    flowchartStep.changeDetectorRef.detectChanges();

    if (parentStep) {
      parentStep.children.push(flowchartStep.instance);
    }
  }
}

const mock: FlowchartStep = {
  STEP_NAME: 'DROP_AREA',
  data: {
    title: '1st component',
  },
  coordinates: {
    x: 600,
    y: 150,
  },
};
