import { FlowchartComponent } from './../../flowchart.component';
import { CdkDrag, Point } from '@angular/cdk/drag-drop';
import {
  Component,
  ComponentRef,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';
import { FlowchartRendererService } from '../../services/flowchart.service';
import {
  FlowchartStep,
  FlowchartStepCoordinates,
} from '../../types/flowchart-step.type';
import { FlowchartConstantsEnum } from '../../helpers/flowchart-constants.enum';
import { FlowchartStepDynamicComponent } from '../flowchart-step-dynamic-component/flowchart-step-dynamic.component';
import { stepsMap } from '../../helpers/flowchart-steps-registry';
import { ConnectorsService } from '../../services/connectors.service';

@Component({
  standalone: true,
  selector: 'flowchart-step',
  templateUrl: './flowchart-step.component.html',
  styleUrl: './flowchart-step.component.scss',
  hostDirectives: [CdkDrag],
})
export class FlowchartStepComponent {
  /**
   * View container onde será inserido o componente dinâmico associado à esse step
   */
  @ViewChild('container', { read: ViewContainerRef })
  private componentContainer: ViewContainerRef;
  /**
   * Pai do step
   */
  @Input()
  private parent: FlowchartStepComponent;
  @Input()
  private pendingComponent: FlowchartStep;
  @Input()
  private id: string;
  @Input()
  private hostView: ViewRef;

  private associatedComponent: FlowchartStepDynamicComponent;

  public children: Array<FlowchartStepComponent> = [];

  constructor(
    private flowchartRendererService: FlowchartRendererService,
    private connectorsService: ConnectorsService,
    private elementRef: ElementRef<HTMLElement>,
    private renderer2: Renderer2,
    public dragDir: CdkDrag
  ) {
    this.setCdkDragBoundary();
  }

  ngOnInit() {
    this.renderer2.addClass(
      this.elementRef.nativeElement,
      FlowchartConstantsEnum.FLOWCHART_STEP_CLASS
    );

    this.renderer2.setAttribute(this.elementRef.nativeElement, 'id', this.id);
  }

  ngAfterViewInit() {
    this.createAssociatedComponent(this.pendingComponent);

    if (this.pendingComponent.coordinates) {
      this.setCoordinates(this.pendingComponent.coordinates);
    }
  }

  /**
   * Seta coordenadas do step
   * @param point Ponto a ser setado
   */
  public setCoordinates(point: Point): void {
    this.dragDir.setFreeDragPosition({ x: point.x, y: point.y });
  }

  /**
   * Cria o componente dinâmico associado à esse flowStep
   */
  public createAssociatedComponent(
    pendingComponent: FlowchartStep
  ): ComponentRef<FlowchartStepDynamicComponent> {
    const componentRef: ComponentRef<FlowchartStepDynamicComponent> =
      this.componentContainer.createComponent(
        stepsMap.get(pendingComponent.STEP_NAME)
      );

    this.associatedComponent = componentRef.instance;

    componentRef.setInput('data', pendingComponent.data);
    componentRef.setInput('associatedStep', this);
    componentRef.changeDetectorRef.detectChanges();

    return componentRef;
  }

  /**
   * Remove apenas o componente associado e mantém o container do flowchartStep
   */
  public removeAssociatedComponent(): void {
    this.componentContainer.remove(0);
  }

  /**
   * Remove o flowchartStep
   */
  protected removeSelf(): void {
    this.flowchartRendererService.removeStep(this.hostView);
  }

  /**
   * Adiciona um componente filho
   * @param pendingComponent Componente a ser adicioando
   */
  public addChild(pendingComponent: FlowchartStep): void {
    const step = this.flowchartRendererService.createStep(
      {
        STEP_NAME: pendingComponent.STEP_NAME,
      },
      this
    );

    step.calculateCoordinates();
  }

  /**
   * Calcula posição do step no flowchart com base nas suas dimensões / coordenadas
   */
  private calculateCoordinates(): void {
    const parentStepCoordinates = this.parent.getCoordinates();

    const parentStepCenter =
      parentStepCoordinates.x + parentStepCoordinates.width / 2;
    const stepCoordinates = this.getCoordinates();

    this.setCoordinates({
      x: parentStepCenter - stepCoordinates.width / 2,
      y:
        parentStepCoordinates.y +
        stepCoordinates.height +
        FlowchartConstantsEnum.FLOWCHART_STEPS_GAP,
    });
  }

  /**
   * Seta limite de drag dentro do elemento do {@link FlowchartComponent}
   */
  private setCdkDragBoundary(): void {
    this.dragDir.boundaryElement = this.flowchartRendererService.flowchartEl;
  }

  /**
   * Retorna coordenadas do step
   * @returns
   */
  private getCoordinates(): FlowchartStepCoordinates {
    const { height, width } =
      this.elementRef.nativeElement.getBoundingClientRect();

    return { ...this.dragDir.getFreeDragPosition(), height, width };
  }

  log() {
    console.log(this);
  }
}
