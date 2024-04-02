import { FlowchartConstants } from '../../helpers/flowchart-constants';
import { FlowchartComponent } from './../../flowchart.component';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart, Point } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';
import { FlowchartStep, FlowchartStepCoordinates } from '../../types/flowchart-step.type';
import { FlowchartConnectorsService } from '../../services/flowchart-connectors.service';
import { FlowchartStepsService } from '../../services/flowchart-steps.service';
import { FlowchartCoordinatesStorageService } from '../../services/flowchart-coordinates-storage.service';
import { FlowchartRendererService } from '../../services/flowchart-renderer.service';
import { FlowchartStepsDataType } from '../../types/flowchart-steps-data-type';
import { FlowchartStepsEnum } from '../../enums/flowchart-steps.enum';
import { FlowchartStepResultsEnum } from '../../enums/flowchart-step-results-enum';
import { Subject, takeUntil } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { cloneDeep } from 'lodash';

@Component({
  standalone: true,
  selector: 'flowchart-step',
  template: '',
  hostDirectives: [CdkDrag],
  host: { '[@animation]': '' },
  animations: [
    trigger('animation', [
      transition(':enter', [
        style({
          opacity: 0,
          scale: 0,
        }),
        animate(
          '.5s .1s ease',
          style({
            opacity: 1,
            scale: 1.1,
          })
        ),
        animate(
          '.5s ease',
          style({
            opacity: 1,
            scale: 1,
          })
        ),
      ]),
      transition(':leave', [
        style({
          opacity: 1,
          scale: 1,
        }),
        animate(
          '.3s ease',
          style({
            opacity: 0,
            scale: 0,
          })
        ),
      ]),
    ]),
  ],
})
export class FlowchartStepComponent<T extends FlowchartStepsDataType = FlowchartStepsDataType>
  implements AfterViewInit, OnDestroy
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
  public afterStepDestroy: (step: FlowchartStepComponent, recursive?: boolean) => void;

  /**
   * Bind de estilo de transição ao host para ser controlado programaticamente
   */
  @HostBinding('style.transition') private transition: '.3s ease' | null = '.3s ease';
  @HostBinding('style.transform-origin') private transformOrigin: string;

  @HostListener('dblclick') private onDoubleClick() {
    const change = (step: FlowchartStepComponent) => {
      step.id = this.flowchartStepsService.generateRandomId();
      for (let child of step.children) {
        setTimeout(() => {
          change(child);
        }, 50);
      }
    };

    const clone = cloneDeep(this);
    change(clone);

    this.flowchartStepsService.stepclone = clone;
  }
  /**
   * Hook chamado após inicialização de children desse step
   */
  public afterChildrenInit: () => void;

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
   * Subject para unsubscribe onDestroy
   */
  private readonly destroySubject$ = new Subject();

  /**
   * @private
   * @readonly
   * Renderer2
   */
  protected readonly renderer2 = inject(Renderer2);
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
  protected readonly flowchartRendererService = inject(FlowchartRendererService);
  /**
   * @private
   * @readonly
   * Serviço de conectores
   */
  public readonly connectorsService = inject(FlowchartConnectorsService);
  /**
   * @private
   * @readonly
   * Referência à hostDiretctive CdkDrag
   */
  protected readonly dragDir = inject(CdkDrag);

  ngAfterViewInit() {
    this.setCdkDragBoundary();
    this.setCdkDragEventsCallbacks();
    this.setHostElementDefaults();
    this.afterStepRender?.(this);
    this.observeHostResize();
  }

  ngOnDestroy() {
    this.destroySubject$.next(null);
    this.destroySubject$.complete();
  }

  /**
   * Adiciona um step filho
   * @param pendingComponent step a ser adicionado
   * @param asSibling Se o step a ser adicionado deve ser adicionado como irmão dos atuais filhos desse step(default true). Caso não for sibling,
   * os filhos desse step serão realocados como children do novo step inserido
   * @type
   */
  public async addChild<T extends FlowchartStepsDataType>({
    pendingComponent,
    asSibling,
    asPlaceholder,
  }: {
    pendingComponent: FlowchartStep<T>;
    asSibling?: boolean;
    asPlaceholder?: boolean;
    log?: boolean;
  }): Promise<FlowchartStepComponent<T>> {
    const child = await this.flowchartStepsService.createStep({
      pendingStep: pendingComponent,
      parentStep: this,
      asSibling,
      asPlaceholder: asPlaceholder ?? this.isPlaceholder,
    });

    return child;
  }

  /**
   * Adiciona droparea à este step
   */
  public addDroparea(): void {
    this.addChild({
      pendingComponent: {
        type: FlowchartStepsEnum.STEP_DROPAREA,
      },
      asSibling: false,
    });
  }

  /**
   * Remove o flowchartStep
   * @param recursive Se deve remover os steps subsequentes
   */
  public removeSelf(recursive?: boolean): void {
    this.compRef.destroy();
    this.afterStepDestroy(this, recursive);
    this.flowchartRendererService.render();

    if (this.hasMoreThanOneChild() && !recursive && !this.flowchartRendererService.isDraggingNewStep) {
      this.children[1].removeSelf(true);
    }

    if (recursive) {
      this.children.forEach((child) => child.removeSelf(true));
    }
  }

  /**
   * Seta coordenadas do step
   * @param point Ponto a ser setado
   */
  public setCoordinates({ x, y }: Point): void {
    this.dragDir.setFreeDragPosition({ x, y });

    if (this.elementRef.nativeElement.style.transform) {
      const x = Number(
        this.elementRef.nativeElement.style.transform
          .replace('translate3d(', '')
          .replace(',0px)', '')
          .split(',')[0]
          .trim()
          .replace(/\D/g, '')
      );
      const y = Number(
        this.elementRef.nativeElement.style.transform
          .replace('translate3d(', '')
          .replace('0px)', '')
          .split(',')[1]
          .trim()
          .replace(/\D/g, '')
      );

      this.transformOrigin = `${x + this.getCoordinates().width / 2}px ${y + this.getCoordinates().height / 2}px`;
    }

    setTimeout(() => {
      this.connectorsService.drawConnectors(this.parent);
    }, 100);
  }

  /**
   * Retorna coordenadas do step
   * @returns
   */
  public getCoordinates(): FlowchartStepCoordinates {
    const { height, width } = {
      height: this.elementRef.nativeElement.offsetHeight,
      width: this.elementRef.nativeElement.offsetWidth,
    };

    return {
      ...this.dragDir.getFreeDragPosition(),
      height,
      width,
    };
  }

  /**
   * Seta limite de drag dentro do elemento do {@link FlowchartComponent}
   */
  private setCdkDragBoundary(): void {
    if (this.type == FlowchartStepsEnum.STEP_INITIAL) this.dragDir.disabled = true;

    this.dragDir.boundaryElement = this.flowchartStepsService.flowchartElement;
  }

  /**
   * Seta callbacks para eventos de drag {@link dragDir}
   */
  private setCdkDragEventsCallbacks(): void {
    this.dragDir.moved.pipe(takeUntil(this.destroySubject$)).subscribe((e) => this.onDragMoved(e));
    this.dragDir.started.pipe(takeUntil(this.destroySubject$)).subscribe((e) => this.onDragStart(e));
    this.dragDir.ended.pipe(takeUntil(this.destroySubject$)).subscribe((e) => this.onDragEnd(e));
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
    this.transition = '.3s ease';
    this.children.forEach((child) => child.onDragEnd(e));
  }

  /**
   * Callback when dragging component
   * @param dragEvent Event
   */
  protected onDragMoved(dragEvent: CdkDragMove, storeCoordinates = true): void {
    if (storeCoordinates) {
      FlowchartCoordinatesStorageService.setStepCoordinates(this.id, this.getCoordinates());
    }

    this.children.forEach((child) => {
      const { x, y } = child.dragPositionBeforeDragStart ? child.dragPositionBeforeDragStart : child.getCoordinates();

      child.setCoordinates({
        x: x + dragEvent.distance.x,
        y: y + dragEvent.distance.y,
      });

      child.onDragMoved(dragEvent, false);
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
    this.renderer2.addClass(this.elementRef.nativeElement, FlowchartConstants.FLOWCHART_STEP_CLASS);

    this.renderer2.setAttribute(this.elementRef.nativeElement, 'id', this.id);
  }

  /**
   * Observa mudança de tamanho do hostElement para reajustar coordenadas automaticamente
   */
  private observeHostResize(): void {
    new ResizeObserver((entries) => {
      if (entries[0].contentRect.width == 0) return;
      this.flowchartRendererService.renderStepTree(this.parent);
    }).observe(this.elementRef.nativeElement);
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
  public hasBeenDragged(): boolean {
    return FlowchartCoordinatesStorageService.getStepCoordinates(this.id) != null;
  }

  /**
   * Retorna se este step possui um caminho de erro entre os seus filhos
   */
  public hasErrorPath(): boolean {
    return this.children.some(
      (child) =>
        child.type == FlowchartStepsEnum.STEP_RESULT && child.data?.resultType == FlowchartStepResultsEnum.ERROR
    );
  }

  /**
   * Retorna se tem children
   */
  public hasChildren(): boolean {
    return this.children.length > 0;
  }
  /**
   * Retorna se tem mais de 1 child
   */
  public hasMoreThanOneChild(): boolean {
    return this.children.length > 1;
  }
}
