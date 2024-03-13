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
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  Type,
  inject,
} from '@angular/core';
import {
  FlowchartStep,
  FlowchartStepCoordinates,
} from '../../types/flowchart-step.type';
import { ConnectorsService } from '../../services/connectors.service';
import { DOCUMENT } from '@angular/common';
import { FlowchartStepsService } from '../../services/flowchart-steps.service';
import { CoordinatesStorageService } from '../../services/coordinates-storage.service';
import { FlowBlocksEnum } from '../../helpers/flowchart-steps-registry';
import { FlowchartService } from '../../services/flowchart.service';

@Component({
  standalone: true,
  selector: 'flowchart-step',
  template: '',
  hostDirectives: [CdkDrag],
})
export class FlowchartStepComponent<T = any>
  implements OnInit, AfterViewInit, OnDestroy
{
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
   * Tipo do step
   */
  @Input()
  public type: FlowBlocksEnum;
  /**
   * Dados do step
   */
  @Input()
  protected data: T;
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
    thisCoordinates: FlowchartStepCoordinates,
    recursive?: boolean,
    firstRecursion?: boolean
  ) => void;

  /**
   * Steps filhos
   */
  public children?: Array<FlowchartStepComponent> = [];

  /**
   * Contém coordenadas do step antes de começar a ser arrastado, para fazer cálculos de drag de steps children
   */
  private dragPositionBeforeDragStart: FlowchartStepCoordinates;

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
  public readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  /**
   * @private
   * @readonly
   * Serviço do flowchart
   */
  protected readonly flowchartStepsService = inject(FlowchartStepsService);
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

  ngOnInit() {
    if (this.type == FlowBlocksEnum.INITIAL_STEP) this.dragDir.disabled = true;
  }

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
    return this.flowchartStepsService.createStep({
      pendingStep: pendingComponent,
      parentStep: this,
      asSibling,
    });
  }

  /**
   * Remove o flowchartStep
   * @param recursive Se deve remover os steps subsequentes
   */
  public removeSelf(recursive?: boolean, firstRecursion = true): void {
    const thisCoordinates = this.getCoordinates();
    this.compRef.destroy();
    this.afterStepDestroy(this, thisCoordinates, recursive, firstRecursion);

    if (recursive) {
      this.children.forEach((child) => child.removeSelf(true, false));
    }
  }

  /**
   * Seta coordenadas do step
   * @param point Ponto a ser setado
   */
  public setCoordinates(point: Point): void {
    if (!point) return;

    this.dragDir.setFreeDragPosition({ x: point.x, y: point.y });
    this.connectorsService.drawConnectors(this.parent);
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
   * Redesenha árvore de conectores a partir desse step
   */
  public redrawConnectorsTree(): void {
    this.connectorsService.drawConnectors(this);
    this.children.forEach((child) => child.redrawConnectorsTree());
  }

  public moveSelfAndAllChildren({ x, y }: Point) {
    const thisCoordinates = this.getCoordinates();
    this.setCoordinates({
      x: thisCoordinates.x + x,
      y: thisCoordinates.y + y,
    });

    this.children.forEach((child) => child.moveSelfAndAllChildren({ x, y }));
  }

  /**
   * Retorna irmãos deste step
   */
  public getSiblings(): Array<FlowchartStepComponent> {
    return this.parent?.children.filter((child) => child.id !== this.id);
  }

  /**
   * Retorna se este step foi arrastado e está em posição diferente da setada automaticamente pelo pai
   */
  public hasBeenDragged() {
    return CoordinatesStorageService.getStepCoordinates(this.id) != null;
  }

  public toggleTreeOpacity() {
    this.children.forEach((child) => {
      child.opacity == '.3' ? (child.opacity = '1') : (child.opacity = '.3');
      child.toggleTreeOpacity();
    });
  }

  @HostListener('dragenter', ['$event']) dragEnter(e: DragEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }

  @HostBinding('style.opacity') opacity = '1';
  // @HostBinding('style.transition') transition = '.2s ease';

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
    this.dragDir.boundaryElement = this.flowchartStepsService.flowchartElement;
  }

  /**
   * Callback when starting to drag the component
   * @param dragEvent Event
   */
  private onDragStart(dragEvent: CdkDragStart) {
    // this.animation = null;
    this.dragPositionBeforeDragStart = this.getCoordinates();
    this.children.forEach((child) => child.onDragStart(dragEvent));
  }

  /**
   * Callback after stopped dragging component
   * @param dragEvent Event
   */
  private onDragEnd(e: CdkDragEnd) {
    // this.animation = '.2s ease';
  }

  /**
   * Callback when dragging component
   * @param dragEvent Event
   */
  public onDragMoved(dragEvent: CdkDragMove): void {
    CoordinatesStorageService.setStepCoordinates(
      this.id,
      this.getCoordinates()
    );

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
