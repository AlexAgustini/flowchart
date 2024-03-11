import {
  Injectable,
  Injector,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import {
  FlowchartStepConnector,
  FlowchartStepCoordinates,
} from '../types/flowchart-step.type';
import { FlowchartService } from './flowchart.service';

@Injectable({
  providedIn: 'root',
})
export class ConnectorsService {
  /**
   * Elemento SVG que contém todos os paths
   */
  private svgCanvas: SVGElement;
  /**
   * Renderer2 {@link Renderer2}
   */
  private readonly renderer2: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    injector: Injector,
    private flowchartService: FlowchartService
  ) {
    this.renderer2 = rendererFactory.createRenderer(null, null);
  }

  /**
   * Inicializa campo que contém o elemento de svg
   */
  public registerSvg(svg: SVGElement): void {
    this.svgCanvas = svg;
  }

  /**
   * Desenha conectores entre um step e seus filhos
   */
  public drawConnectors(step: FlowchartStepComponent): void {
    if (!step) return;

    step.children.forEach((child) => {
      let connector = this.getParentChildConnector(step.id, child.id);

      if (!connector) {
        connector = this.createConnector(step.id, child.id);
      }

      const stepDimensions = step.getCoordinates();
      const childDimensions = child.getCoordinates();

      this.drawPath(connector.path, stepDimensions, childDimensions);
    });
  }

  /**
   * Cria conector
   * @param parentId Id do pai
   * @param childId Id do filho
   */
  private createConnector(
    parentId: string,
    childId: string
  ): FlowchartStepConnector {
    const path = this.renderer2.createElement(
      'path',
      'http://www.w3.org/2000/svg'
    );
    this.renderer2.appendChild(this.svgCanvas, path);
    this.renderer2.setAttribute(path, 'id', `${parentId}-${childId}`);

    const connector = { path, parentId, childId };
    this.flowchartService.addConnector(connector);
    this.observePathEvents(path);

    return connector;
  }

  /**
   * Calcula e renderiza path
   * @param path Elemento path a ter o atributo "d" setado
   * @param parentCoordinates  Coordenadas do step pai
   * @param childCoordinates Coordenadas do step filho
   */
  private drawPath(
    path: SVGPathElement,
    parentCoordinates: FlowchartStepCoordinates,
    childCoordinates: FlowchartStepCoordinates
  ): void {
    const parentElXCenter = parentCoordinates.x + parentCoordinates.width / 2;
    const parentElYBottom = parentCoordinates.y + parentCoordinates.height;
    const childElXCenter = childCoordinates.x + childCoordinates.width / 2;
    const childElYTop = childCoordinates.y;

    const deltaX = childElXCenter - parentElXCenter;
    const deltaY = childElYTop - parentElYBottom;

    let hypotenuse = Math.sqrt(deltaX ** 2 + deltaY ** 2) / 3;
    hypotenuse = Math.min(hypotenuse, 30);

    const controlPointX1 = parentElXCenter;
    const controlPointY1 = parentElYBottom + hypotenuse;
    const controlPointX2 = childElXCenter;
    const controlPointY2 = childElYTop - hypotenuse;

    // Construct the SVG path
    let pathD = `M${parentElXCenter},${parentElYBottom} C${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${childElXCenter},${childElYTop}`;

    path.setAttribute('d', pathD);
  }

  /**
   * Remove conectores de um step destruído
   * @param step Step destruído
   */
  public clearDestroyedStepConnectors(step: FlowchartStepComponent): void {
    if (!step) return;

    this.removeConnector(step.parent?.id, step.id);
    step.children.forEach((child) => this.removeConnector(step.id, child.id));
  }

  /**
   * Remove conector(path) do svg
   * @param childId Id do step pai
   * @param parentId Id do step filho
   */
  public removeConnector(childId: string, parentId: string): void {
    const connector = this.getParentChildConnector(childId, parentId);
    if (!connector) return;
    try {
      this.flowchartService.removeConnector(connector);
      this.renderer2.removeChild(this.svgCanvas, connector.path);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Retorna conector entre pai e filho, caso existente
   * @param parentId Id do step pai
   * @param childId Id do step filho
   */
  private getParentChildConnector(
    parentId: string,
    childId: string
  ): FlowchartStepConnector {
    return this.flowchartService.connectors.find(
      (connector) =>
        connector.parentId == parentId && connector.childId == childId
    );
  }

  /**
   * Observa eventos de mouse emitidos pelo path
   */
  private observePathEvents(path: SVGPathElement): void {
    path.addEventListener('dragover', (e) => {
      // console.log(e);
    });
  }
}
