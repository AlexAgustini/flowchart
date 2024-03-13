import { Flow, FlowchartStepConnector } from './../types/flowchart-step.type';
import {
  ElementRef,
  Injectable,
  Renderer2,
  RendererFactory2,
  ViewContainerRef,
} from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { Point } from '@angular/cdk/drag-drop';
import { FlowchartConstants } from '../helpers/flowchart-constants.enum';

@Injectable({
  providedIn: 'root',
})
export class FlowchartService {
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

  public registerFlowchart(
    flowchartViewContainer: ViewContainerRef,
    flowchartElement: ElementRef<HTMLElement>,
    svgCanvas: ElementRef<SVGElement>
  ) {
    this.flowchartViewContainer = flowchartViewContainer;
    this.flowchartElement = flowchartElement;
    this.svgCanvas = svgCanvas;
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
      this.connectors.findIndex(
        (c) =>
          c.parentId == connector.parentId && c.childId == connector.childId
      ),
      1
    );
  }

  /**
   * Recentraliza os steps do flow e aumenta width do {@link flowchartElement} caso necessário
   */
  public reCenterFlow(): void {
    if (!this.steps.length) return;

    // Step mais à esquerda do chart
    const lowestXStep = this.steps
      .reduce((prev, curr) => {
        return prev.getCoordinates().x < curr.getCoordinates().x ? prev : curr;
      })
      .getCoordinates();

    // Step mais à direita do chart
    const highestXStep = this.steps
      .reduce((prev, curr) => {
        return prev.getCoordinates().x + prev.getCoordinates().width >
          curr.getCoordinates().x + curr.getCoordinates().width
          ? prev
          : curr;
      })
      .getCoordinates();

    const lengthBetweenSteps =
      highestXStep.x + highestXStep.width - lowestXStep.x;
    const flowClientWidth = this.flowchartElement.nativeElement.clientWidth;

    if (lengthBetweenSteps > flowClientWidth) {
      // Adiciona padding mínimo left / right
      const totalWidth =
        lengthBetweenSteps + FlowchartConstants.FLOWCHART_INLINE_PADDING * 2;

      // Não é possível alterar o scrollWidth de um elemento diretamente,
      // então é setada a width total em uma div helper que é filha do flowchartElement
      const scrollWidthDiv: HTMLDivElement =
        this.flowchartElement.nativeElement.querySelector(
          `.${FlowchartConstants.FLOWCHART_SCROLL_WIDTH_DIV_CLASS}`
        );

      scrollWidthDiv.style.width = `${totalWidth}px`;

      this.resizeSvgCanvas();
    }

    const rootStep = this.getRootStep();
    const rootStepCoordinates = rootStep.getCoordinates();

    const flowchartXCenter =
      this.flowchartElement.nativeElement.scrollWidth / 2;
    const rootStepXDiff =
      flowchartXCenter -
      (rootStepCoordinates.x + rootStepCoordinates.width / 2);

    rootStep.moveSelfAndAllChildren({ x: rootStepXDiff, y: 0 });
  }

  /**
   * Mantém o width e height do {@link svgCanvas} iguais ao width e height do {@link flowchartElement} (considerando medidas de scroll)
   */
  private resizeSvgCanvas(): void {
    this.svgCanvas.nativeElement.style.height = `${this.flowchartElement.nativeElement.scrollHeight}px`;
    this.svgCanvas.nativeElement.style.width = `${this.flowchartElement.nativeElement.scrollWidth}px`;
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
   * Calcula coordenadas coordenadas de um ponto XY relativos à tela e os retorna relativos ao elemento do flowchart
   * @param point Ponto a ser calculado
   */
  public getPointXYRelativeToFlowchart(point: Point): Point {
    return {
      x: point.x - this.flowchartBoundingRect.x,
      y: point.y - this.flowchartBoundingRect.y,
    };
  }

  /**
   * Retorna dimensões do flowchart
   */
  public get flowchartBoundingRect() {
    return this.flowchartElement.nativeElement.getBoundingClientRect();
  }
}
