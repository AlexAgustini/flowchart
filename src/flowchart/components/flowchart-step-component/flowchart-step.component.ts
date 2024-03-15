import { FlowchartConstants } from '../../helpers/flowchart-constants';
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
import { FlowchartService } from '../../services/flowchart.service';
import { FlowchartStepsDataType } from '../../helpers/flowchart-steps-data-type';
import { FlowchartStepsEnum } from '../../helpers/flowchart-steps.enum';

@Component({
  standalone: true,
  selector: 'flowchart-step',
  template: '',
  hostDirectives: [CdkDrag],
})
export abstract class FlowchartStepComponent<
  T extends FlowchartStepsDataType = FlowchartStepsDataType
> implements OnInit, AfterViewInit, OnDestroy
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
  public type: FlowchartStepsEnum;
  /**
   * Dados do step
   */
  @Input()
  public data: T;
  /**
   * Referência ao componente do step
   */
  @Input()
  public compRef: ComponentRef<FlowchartStepComponent>;
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
    recursive?: boolean
  ) => void;

  /**
   * Binda estilo de transição ao host para ser controlado programaticamente
   */
  @HostBinding('style.transition') private transition: '.2s ease' | null =
    '.2s ease';

  /**
   * Steps filhos
   */
  public children?: Array<FlowchartStepComponent> = [];

  /**
   * Flag que indica se o step está sendo exibido como placeholder
   */
  private _isPlaceholder: boolean;

  /**
   * {@link _isPlaceholder}
   */
  public get isPlaceholder(): boolean {
    return this._isPlaceholder;
  }

  /**
   * {@link _isPlaceholder}
   */
  public set isPlaceholder(value: boolean) {
    this._isPlaceholder = value;
    if (value) {
      this.elementRef.nativeElement.classList.add('placeholder');
    } else {
      this.elementRef.nativeElement.classList.remove('placeholder');
    }
  }

  /**
   * Contém coordenadas do step antes de começar a ser arrastado, para fazer cálculos de drag de steps children
   */
  private _dragPositionBeforeDragStart: FlowchartStepCoordinates;

  /**
   * {@link _dragPositionBeforeDragStart}
   */
  public get dragPositionBeforeDragStart(): FlowchartStepCoordinates {
    return this._dragPositionBeforeDragStart;
  }

  /**
   * {@link _dragPositionBeforeDragStart}
   */
  public set dragPositionBeforeDragStart(value: FlowchartStepCoordinates) {
    this._dragPositionBeforeDragStart = value;
  }

  /**
   * Guarda coordenadas do step antes de ele ser afetado pela exibição de um placeholder
   * Estas coordenadas são utilizadas caso o placeholder seja removido, para retornar o step e seus descendentes à posição original
   */
  private _dragPositionBeforeBeingAffectedByPlaceholder: FlowchartStepCoordinates;

  /**
   * {@link _dragPositionBeforeBeingAffectedByPlaceholder}
   */
  public get dragPositionBeforeBeingAffectedByPlaceholder(): FlowchartStepCoordinates {
    return this._dragPositionBeforeBeingAffectedByPlaceholder;
  }

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
  protected readonly flowchartService = inject(FlowchartService);
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
    if (this.type == FlowchartStepsEnum.STEP_INITIAL)
      this.dragDir.disabled = true;
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
   * @type
   */
  public addChild<T extends FlowchartStepsDataType>({
    pendingComponent,
    asSibling,
    asPlaceholder,
  }: {
    pendingComponent: FlowchartStep<T>;
    asSibling?: boolean;
    asPlaceholder?: boolean;
  }): FlowchartStepComponent<T> {
    return this.flowchartStepsService.createStep({
      pendingStep: pendingComponent,
      parentStep: this,
      asSibling,
      asPlaceholder: asPlaceholder ?? this.isPlaceholder,
    });
  }

  /**
   * Remove o flowchartStep
   * @param recursive Se deve remover os steps subsequentes
   */
  public removeSelf(recursive?: boolean): void {
    const thisCoordinates = this.getCoordinates();
    this.compRef.destroy();
    this.afterStepDestroy(this, thisCoordinates, recursive);

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
   * Armazena coordenadas deste step antes previamente a ter suas coordenadas afetada pela exibição de um placeholder
   * {@link _dragPositionBeforeBeingAffectedByPlaceholder}
   */
  public storeDragCoordinatesBeforeBeingAffectedByPlaceholder(): void {
    this._dragPositionBeforeBeingAffectedByPlaceholder = this.getCoordinates();
    this.children.forEach((child) =>
      child.storeDragCoordinatesBeforeBeingAffectedByPlaceholder()
    );
  }

  /**
   * Restaura coordenadas originais deste step após a remoção de um placeholder que afetou suas coordenadas originais
   * {@link _dragPositionBeforeBeingAffectedByPlaceholder}
   */
  public restoreDragCoordinatesToBeforeBeingAffectedByPlaceholder(): void {
    this.setCoordinates(this._dragPositionBeforeBeingAffectedByPlaceholder);
    this.children.forEach((child) =>
      child.restoreDragCoordinatesToBeforeBeingAffectedByPlaceholder()
    );
  }

  /**
   * Redesenha árvore de conectores a partir desse step
   */
  public redrawConnectorsTree(): void {
    this.connectorsService.drawConnectors(this);
    this.children.forEach((child) => child.redrawConnectorsTree());
  }

  /**
   * Move step e todos steps subsequentes
   * @param x Quantidade a ser movida no eixo x
   * @param y Quantidade a ser movida no eiyo x
   */
  public moveSelfAndAllChildren({ x, y }: Point): void {
    const thisCoordinates = this.getCoordinates();

    // Se as coordenadas forem iguais, não seta coordenadas para evitar re-animação de conectores
    if (
      thisCoordinates.x + x == thisCoordinates.x &&
      thisCoordinates.y + y == thisCoordinates.y
    )
      return;

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

  public hideTree() {
    // this.children.forEach((child) => {
    //   child.opacity = '.3';
    //   child.children.forEach((child) => child.hideTree());
    // });
  }

  public showTree() {
    // this.children.forEach((child) => {
    //   child.opacity = '1';
    //   child.children.forEach((child) => child.showTree());
    // });
  }

  /**
   * Seta limite de drag dentro do elemento do {@link FlowchartComponent}
   */
  private setCdkDragBoundary(): void {
    this.dragDir.boundaryElement = this.flowchartStepsService.flowchartElement;
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
   * Callback when starting to drag the component
   * @param dragEvent Event
   */
  private onDragStart(dragEvent: CdkDragStart) {
    this.transition = null;

    this.dragPositionBeforeDragStart = this.getCoordinates();
    this.children.forEach((child) => child.onDragStart(dragEvent));
  }

  /**
   * Callback after stopped dragging component
   * @param dragEvent Event
   */
  private onDragEnd(e: CdkDragEnd) {
    this.transition = '.2s ease';
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
