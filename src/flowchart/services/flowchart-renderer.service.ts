import { Flow, FlowchartStepConnector, FlowchartStepCoordinates } from '../types/flowchart-step.type';
import { ElementRef, Injectable, ViewContainerRef, ViewChild } from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { Point } from '@angular/cdk/drag-drop';
import { FlowchartConstants } from '../helpers/flowchart-constants';
import { fromEvent } from 'rxjs';
import { FlowchartStepsEnum } from '../enums/flowchart-steps.enum';
import { FlowchartStepRequestComponent } from '../components/steps';

@Injectable({
  providedIn: 'root',
})
export class FlowchartRendererService {
  public flow: Flow = {
    steps: [],
    connectors: [],
  };

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
  private _isDragging: boolean;

  public get isDragging(): boolean {
    return this._isDragging;
  }
  public set isDragging(value: boolean) {
    this._isDragging = value;
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
   * Recentraliza os steps do flow e aumenta dimensões do {@link flowchartElement} caso necessário
   */
  public async reCenterFlow(): Promise<void> {
    if (!this.steps.length || this.isDragging) return;

    const rootStep = this.getRootStep();
    const rootStepCoordinates = rootStep.getCoordinates();

    const flowchartXCenter = this.flowchartElement.nativeElement.scrollWidth / 2;
    const rootStepXDiff = flowchartXCenter - (rootStepCoordinates.x + rootStepCoordinates.width / 2);

    rootStep.moveSelfAndAllChildren({
      x: rootStepXDiff > 10 ? rootStepXDiff : 0,
      y: 0,
    });
    this.render();
    this.treatFlowchartDimensions();
    this.resizeSvgCanvas();
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
    return this.steps[0];
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
        this.reCenterFlow();
      },
    });
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

    const flowchartScrollWidth = this.flowchartElement.nativeElement.scrollWidth;
    const flowchartScrollHeight = this.flowchartElement.nativeElement.scrollHeight;

    const isXOverflowingToLeft = lowestXStep.x - FlowchartConstants.FLOWCHART_MIN_INLINE_PADDING < 0;
    const isXOverflowingToRight =
      highestXStep.x + highestXStep.width + FlowchartConstants.FLOWCHART_MIN_INLINE_PADDING > flowchartScrollWidth;
    const isYOverflowing =
      highestYStep.y + highestYStep.height + FlowchartConstants.FLOWCHART_MIN_BOTTOM_PADDING * 4 >=
      flowchartScrollHeight;

    if (isXOverflowingToLeft) {
      this.setScrollWidthDiv(
        flowchartScrollWidth +
          +Math.abs(lowestXStep.x) +
          lowestXStep.width +
          FlowchartConstants.FLOWCHART_MIN_INLINE_PADDING
      );
    }

    if (isXOverflowingToRight) {
      this.setScrollWidthDiv(
        flowchartScrollWidth + +highestXStep.x + highestXStep.width + FlowchartConstants.FLOWCHART_MIN_INLINE_PADDING
      );

      this.flowchartElement.nativeElement.scrollTo({ left: highestXStep.x });
    }

    if (isYOverflowing) {
      this.setScrollHeightDiv(flowchartScrollHeight + FlowchartConstants.FLOWCHART_MIN_BOTTOM_PADDING * 4);
    }
  }

  private setScrollHeightDiv(height: number): void {
    const scrollHeightDiv: HTMLDivElement = this.flowchartElement.nativeElement.querySelector(
      `.${FlowchartConstants.FLOWCHART_SCROLL_HEIGHT_DIV_CLASS}`
    );

    scrollHeightDiv.style.height = `${height}px`;
  }

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
    this.svgCanvas.nativeElement.style.height = `${this.flowchartElement.nativeElement.scrollHeight}px`;
    this.svgCanvas.nativeElement.style.width = `${
      this.flowchartElement.nativeElement.scrollWidth - FlowchartConstants.FLOWCHART_MIN_INLINE_PADDING
    }px`;
  }

  private getStepTreeWidth(step: FlowchartStepComponent) {
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

  private render() {
    const renderTree = (step: FlowchartStepComponent) => {
      if (!step.children.length) {
        return;
      }

      const stepCoords = step.getCoordinates();
      const stepYBottom = stepCoords.y + stepCoords.height;
      const stepXCenter = stepCoords.x + stepCoords.width / 2;
      const childYTop = stepYBottom + FlowchartConstants.FLOWCHART_STEPS_GAP;

      let totalTreeWidth = 0;

      step.children.forEach((child) => {
        totalTreeWidth += this.getStepTreeWidth(child);
        if (child instanceof FlowchartStepRequestComponent) {
          console.log(this.getStepTreeWidth(child));
        }
      });

      let leftXTree = stepXCenter - totalTreeWidth / 2;

      const hasMoreThanOneChild = step.children.length > 1;

      step.children.forEach((child, i) => {
        const childTreeWidth = this.getStepTreeWidth(child);

        let childX = leftXTree + childTreeWidth / 2 - child.elementRef.nativeElement.offsetWidth / 2;

        if (i > 0) {
          childX = Math.max(childX, this.getStepTreeWidth(step.children[i - 1]));
        }

        child.setCoordinates({
          x: hasMoreThanOneChild && i == 0 ? childX - FlowchartConstants.FLOWCHART_STEPS_GAP : childX,
          y: childYTop,
        });

        leftXTree += childTreeWidth + FlowchartConstants.FLOWCHART_STEPS_GAP;

        renderTree(child);
      });
    };

    renderTree(this.getRootStep());
  }
}
