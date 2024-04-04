import { Flow, FlowchartStepConnector } from '../types/flowchart-step.type';
import { ElementRef, Injectable, ViewContainerRef } from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { Point } from '@angular/cdk/drag-drop';
import { FlowchartConstants } from '../helpers/flowchart-constants';
import { fromEvent } from 'rxjs';
import { FlowchartStepInitialComponent } from '../components/steps';

@Injectable({
  providedIn: 'root',
})
export class FlowchartRendererService {
  public flow: Flow = {
    steps: [],
    connectors: [],
  };

  /**
   * Flag para controle de execuções de método de render
   */
  private isRendering: boolean;

  /**
   * ViewContainer do {@link FlowchartComponent}
   */
  public flowchartViewContainer!: ViewContainerRef;
  /**
   * ElementRef do {@link FlowchartComponent}
   */
  public flowchartElement!: ElementRef<HTMLElement>;
  /**
   * Referência ao svg no qual são desenhados os conectores
   */
  public svgCanvas!: ElementRef<SVGElement>;

  /**
   * Flag que indica se um evento de drag está acontecendo
   */
  private _isDraggingNewStep: boolean;

  public get isDraggingNewStep(): boolean {
    return this._isDraggingNewStep;
  }
  public set isDraggingNewStep(value: boolean) {
    this._isDraggingNewStep = value;
  }

  public registerFlowchart(
    flowchartViewContainer: ViewContainerRef,
    flowchartElement: ElementRef<HTMLElement>,
    svgCanvas: ElementRef<SVGElement>
  ) {
    this.flowchartViewContainer = flowchartViewContainer;
    this.flowchartElement = flowchartElement;
    this.svgCanvas = svgCanvas;

    this.observeEvents();
  }

  /**
   * Adiciona step aos steps do {@link flow}
   * @param step Step a ser adicionado
   */
  public addStep(step: FlowchartStepComponent) {
    this.steps.push(step);
  }

  /**
   * Remove step dos steps do flow
   * @param step Step a ser removido
   */
  public removeStep(step: FlowchartStepComponent) {
    this.steps.splice(
      this.flow.steps.findIndex((s) => s.id == step.id),
      1
    );
  }

  /**
   * Adiciona connector aos conectores do {@link flow}
   * @param connector Conector a ser adicionado
   */
  public addConnector(connector: FlowchartStepConnector) {
    this.connectors.push(connector);
  }

  /**
   * Remove conector dos conectores do flow
   * @param connector Conector a ser removido
   */
  public removeConnector(connector: FlowchartStepConnector) {
    this.flow.connectors.splice(
      this.connectors.findIndex((c) => c.parentId == connector.parentId && c.childId == connector.childId),
      1
    );
  }

  /**
   * Renderiza os steps do flow e faz tratamento de dimensões do {@link flowchartElement} caso necessário
   */
  public async render(): Promise<void> {
    await new Promise((resolve) => setTimeout(() => resolve(true), 100));
    if (!this.steps.length || this.isRendering) return;
    this.isRendering = true;

    this.renderSteps();

    this.treatFlowchartDimensions();
    this.resizeSvgCanvas();
    this.isRendering = false;
  }

  /**
   * Manipula width e height do {@link flowchartElement} de acordo com as dimensões dos teps
   */
  private treatFlowchartDimensions(): void {
    // Step mais à esquerda do chart
    const lowestXStep = this.steps
      .reduce((prev, curr) => (prev.getCoordinates().x < curr.getCoordinates().x ? prev : curr))
      .getCoordinates();

    // Step mais à direita do chart
    const highestXStep = this.steps
      .reduce((prev, curr) =>
        prev.getCoordinates().x + prev.getCoordinates().width > curr.getCoordinates().x + curr.getCoordinates().width
          ? prev
          : curr
      )
      .getCoordinates();

    // Step mais abaixo no chart
    const highestYStep = this.steps
      .reduce((prev, curr) =>
        prev.getCoordinates().y + prev.getCoordinates().height > curr.getCoordinates().y + curr.getCoordinates().height
          ? prev
          : curr
      )
      .getCoordinates();

    this.setScrollWidthDiv(
      highestXStep.x +
        highestXStep.width -
        Math.abs(lowestXStep.x) +
        FlowchartConstants.FLOWCHART_MIN_INLINE_PADDING * 4
    );

    this.setScrollHeightDiv(highestYStep.y + highestXStep.height + FlowchartConstants.FLOWCHART_MIN_BOTTOM_PADDING);
  }

  /**
   * Seta height da div que controla o scroll horizontal do flowchart
   * @param height height a ser setada
   */
  private setScrollHeightDiv(height: number): void {
    const scrollHeightDiv: HTMLDivElement = this.flowchartElement.nativeElement.querySelector(
      `.${FlowchartConstants.FLOWCHART_SCROLL_HEIGHT_DIV_CLASS}`
    );

    scrollHeightDiv.style.height = `${height}px`;
  }

  /**
   * Seta width da div que controla o scroll horizontal do flowchart
   * @param width width a ser setada
   */
  private setScrollWidthDiv(width: number): void {
    const scrollWidthDiv: HTMLDivElement = this.flowchartElement.nativeElement.querySelector(
      `.${FlowchartConstants.FLOWCHART_SCROLL_WIDTH_DIV_CLASS}`
    );

    scrollWidthDiv.style.width = `${width}px`;
  }

  /**
   * Mantém o width e height do {@link svgCanvas} iguais ao width e height do {@link flowchartElement} (considerando medidas de scroll)
   */
  private resizeSvgCanvas(): void {
    this.svgCanvas.nativeElement.style.height = `${
      this.flowchartElement.nativeElement.querySelector(`.${FlowchartConstants.FLOWCHART_SCROLL_HEIGHT_DIV_CLASS}`)
        .clientHeight
    }px`;
    this.svgCanvas.nativeElement.style.width = `${
      this.flowchartElement.nativeElement.querySelector(`.${FlowchartConstants.FLOWCHART_SCROLL_WIDTH_DIV_CLASS}`)
        .clientWidth
    }px`;
  }

  /**
   * Retorna width mínima para renderizar uma árvore de steps
   * @param step Step a ser avaliado
   */
  private getStepTreeWidth(step: FlowchartStepComponent): number {
    const stepWidth = step.elementRef.nativeElement.getBoundingClientRect().width;

    if (!step.children.length) {
      return stepWidth;
    }

    let childrenWidth = step.children.reduce(
      (childTreeWidth, child) => childTreeWidth + this.getStepTreeWidth(child),
      0
    );

    childrenWidth += FlowchartConstants.FLOWCHART_STEPS_GAP;

    return Math.max(stepWidth, childrenWidth);
  }

  /**
   * Renderiza toda árvore de steps
   */
  private renderSteps(): void {
    const rootStep = this.getRootStep();
    const rootStepCoords = rootStep.getCoordinates();
    const flowchartXCenter = this.flowchartElement.nativeElement.scrollWidth / 2;

    rootStep.setCoordinates({
      x: flowchartXCenter - rootStepCoords.width / 2,
      y: 0,
    });

    this.renderStepTree(rootStep);
  }

  /**
   * Renderiza árvore de steps
   * @param step Step
   */
  public renderStepTree(step: FlowchartStepComponent): void {
    if (!step?.children?.length) {
      return;
    }

    const stepCoords = step.getCoordinates();
    const stepYBottom = stepCoords.y + stepCoords.height;
    const stepXCenter = stepCoords.x + stepCoords.width / 2;
    const childYTop = stepYBottom + FlowchartConstants.FLOWCHART_STEPS_GAP;

    const stepTreeWidth = step.children.reduce((acc, curr) => acc + this.getStepTreeWidth(curr), 0);

    let xAccumulator = stepXCenter - stepTreeWidth / 2;

    step.children.forEach((child, i) => {
      if (child.hasBeenDragged()) {
        this.renderStepTree(child);
        return;
      }

      const childTreeWidth = this.getStepTreeWidth(child);

      let childX = xAccumulator + childTreeWidth / 2 - child.elementRef.nativeElement.offsetWidth / 2;

      if (i > 0) {
        childX = Math.max(childX, this.getStepTreeWidth(step.children[i - 1]));
      }

      child.setCoordinates({
        x: step.hasMoreThanOneChild() && i == 0 ? childX - FlowchartConstants.FLOWCHART_STEPS_GAP : childX,
        y: childYTop,
      });

      xAccumulator += childTreeWidth + FlowchartConstants.FLOWCHART_STEPS_GAP;
      this.renderStepTree(child);
    });
  }

  /**
   * Getter de conectores
   */
  public get connectors() {
    return this.flow.connectors;
  }

  /**
   * Getter de steps
   */
  public get steps() {
    return this.flow.steps;
  }

  /**
   * Retorna bloco raíz do fluxo
   */
  public getRootStep(): FlowchartStepComponent {
    return this.steps.find((step) => step instanceof FlowchartStepInitialComponent);
  }

  /**
   * Retorna step do fluxo por id
   * @param id Id buscado
   */
  public getStepById(id: string): FlowchartStepComponent {
    return this.steps.find((step) => step.id == id);
  }

  /**
   * Retorna steps placeholder atuais
   *
   */
  public getAllPlaceholderSteps(): Array<FlowchartStepComponent> {
    return this.steps.filter((step) => step.isPlaceholder);
  }

  /**
   * Retorna steps placeholder atuais
   */
  public hasPlaceholderSteps(): boolean {
    return this.steps.some((step) => step.isPlaceholder);
  }

  /**
   * Calcula coordenadas coordenadas de um ponto XY relativos à tela e os retorna relativos ao elemento do flowchart
   * @param point X/Y relativos à tela
   */
  public getPointXYRelativeToFlowchart(clientX: number, clientY: number): Point {
    return {
      x: clientX + this.flowchartElement.nativeElement.scrollLeft - this.flowchartBoundingRect.left,
      y: clientY + this.flowchartElement.nativeElement.scrollTop - this.flowchartBoundingRect.top,
    };
  }

  /**
   * Retorna dimensões do flowchart
   */
  public get flowchartBoundingRect() {
    return this.flowchartElement.nativeElement.getBoundingClientRect();
  }

  private observeEvents() {
    fromEvent(window, 'resize').subscribe({
      next: () => {
        this.render();
      },
    });
  }
}
