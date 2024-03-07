import { FlowchartConstants } from './../../helpers/flowchart-constants.enum';
import { FlowchartComponent } from './../../flowchart.component';
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragMove,
  CdkDragStart,
  Point,
} from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';
import { FlowchartService } from '../../services/flowchart.service';
import {
  FlowchartStep,
  FlowchartStepConnector,
  FlowchartStepCoordinates,
} from '../../types/flowchart-step.type';
import { ConnectorsService } from '../../services/connectors.service';
import { DOCUMENT } from '@angular/common';
import { FlowBlockTypes } from '../../helpers/flowchart-steps-registry';

@Component({
  standalone: true,
  selector: 'flowchart-step',
  template: '',
  hostDirectives: [CdkDrag],
})
export class FlowchartStepComponent<T = any>
  implements OnInit, AfterViewInit, OnDestroy
{
  static STEP_NAME: FlowBlockTypes;
  /**
   * Pai do step
   */
  @Input()
  public parent: FlowchartStepComponent;
  /**
   * Id do step
   */
  @Input()
  public id: string;
  /**
   * Dados do step
   */
  @Input()
  protected data: T;
  /**
   * Coordenadas do step {@link CdkDrag}
   */
  @Input()
  public coordinates: FlowchartStepCoordinates;
  /**
   * Referência ao componente do step
   */
  @Input()
  private compRef: ComponentRef<FlowchartStepComponent>;
  /**
   * Callbacks a serem chamados apoós renderização do step
   */
  @Input()
  public afterStepRender: (step: FlowchartStepComponent) => void;
  /**
   * Callbacks a serem chamados apoós remoção do step
   */
  @Input()
  public afterStepDestroy: (
    step: FlowchartStepComponent,
    recursive?: boolean
  ) => void;

  /**
   * Steps filhos
   */
  public children?: Array<FlowchartStepComponent> = [];
  /**
   * Conectores do step
   */
  public connectors?: Array<FlowchartStepConnector> = [];
  /**
   * Contém coordenadas do step antes de começar a ser arrastado, para fazer cálculos de drag de steps children
   */
  public dragPositionBeforeDragStart: FlowchartStepCoordinates;
  /**
   * @private
   * @readonly
   * Renderer2
   */
  private readonly renderer2 = inject(Renderer2);
  /**
   * @private
   * @readonly
   * Referência ao elemento nativo
   */
  private readonly elementRef = inject(ElementRef);
  /**
   * @private
   * @readonly
   * Serviço do flowchart
   */
  private readonly flowchartService = inject(FlowchartService);
  /**
   * @private
   * @readonly
   * Referência ao DOM
   */
  private readonly document = inject(DOCUMENT);
  /**
   * @private
   * @readonly
   * Serviço de conectores
   */
  private readonly connectorsService = inject(ConnectorsService);
  /**
   * @private
   * @readonly
   * Referência à hostDiretctive CdkDrag
   */
  private readonly dragDir = inject(CdkDrag);

  ngOnInit() {}

  ngAfterViewInit() {
    this.setCdkDragBoundary();
    this.setCdkDragEventsCallbacks();
    this.setHostElementDefaults();

    this.afterStepRender(this);
  }

  ngOnDestroy() {}

  /**
   * Adiciona um step filho
   * @param pendingComponent step a ser adicionado
   * @param asSibling Se o step a ser adicionado deve ser adicionado como irmão dos atuais filhos desse step(default true). Caso não for sibling,
   * os filhos desse step serão realocados como children do novo step inserido
   */
  public addChild(
    pendingComponent: FlowchartStep,
    asSibling?: boolean
  ): FlowchartStepComponent {
    return this.flowchartService.createStep({
      pendingStep: pendingComponent,
      parentStep: this,
      asSibling,
    });
  }

  /**
   * Remove o flowchartStep
   * @param recursive Se deve remover os steps subsequentes
   */
  protected removeSelf(recursive?: boolean): void {
    this.compRef.destroy();
    this.afterStepDestroy(this, recursive);

    if (recursive) {
      this.children.forEach((child) => child.removeSelf(true));
    }
  }

  /**
   * Seta coordenadas do step
   * @param point Ponto a ser setado
   */
  public setCoordinates(point: Point): void {
    if (!point) return;
    this.dragDir.setFreeDragPosition({ x: point.x, y: point.y });
  }

  /**
   * Retorna coordenadas do step
   * @returns
   */
  public getCoordinates(): FlowchartStepCoordinates {
    const { height, width } =
      this.elementRef.nativeElement.getBoundingClientRect();

    return { ...this.dragDir.getFreeDragPosition(), height, width };
  }

  /**
   * Seta callbacks para eventos de drag {@link dragDir}
   */
  private setCdkDragEventsCallbacks(): void {
    this.dragDir.moved.subscribe((e) => this.onDragMoved(e));
    this.dragDir.started.subscribe((e) => this.onDragStart(e));
    this.dragDir.ended.subscribe((e) => this.onDragEnd(e));
  }

  /**
   * Seta limite de drag dentro do elemento do {@link FlowchartComponent}
   */
  private setCdkDragBoundary(): void {
    const container = this.document.createElement('div');
    container.style.top = `${this.getCoordinates().y}px`;
    container.classList.add(
      FlowchartConstants.FLOWCHART_CDK_DRAG_BOUNDARY_CONTAINER
    );

    this.flowchartService.flowchartEl.appendChild(container);

    this.dragDir.boundaryElement = container;
  }

  /**
   * Callback when starting to drag the component
   * @param dragEvent Event
   */
  private onDragStart(dragEvent: CdkDragStart) {
    this.dragPositionBeforeDragStart = this.getCoordinates();
    this.children.forEach((child) => child.onDragStart(dragEvent));
  }

  /**
   * Callback after stopped dragging component
   * @param dragEvent Event
   */
  private onDragEnd(e: CdkDragEnd) {}

  /**
   * Callback when dragging component
   * @param dragEvent Event
   */
  private onDragMoved(dragEvent: CdkDragMove): void {
    this.children.forEach((child) => {
      const { x, y } = child.dragPositionBeforeDragStart
        ? child.dragPositionBeforeDragStart
        : child.getCoordinates();

      child.setCoordinates({
        x: x + dragEvent.distance.x,
        y: y + dragEvent.distance.y,
      });

      child.onDragMoved(dragEvent);
    });

    this.connectorsService.drawConnectors(this);
    if (this.parent) {
      this.connectorsService.drawConnectors(this.parent);
    }
  }

  /**
   * Seta atributos default do hostElement
   */
  private setHostElementDefaults(): void {
    this.renderer2.addClass(
      this.elementRef.nativeElement,
      FlowchartConstants.FLOWCHART_STEP_CLASS
    );

    this.renderer2.setAttribute(this.elementRef.nativeElement, 'id', this.id);
  }
}
