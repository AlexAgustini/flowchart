import { Injectable, Injector, Renderer2, RendererFactory2 } from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import { FlowchartStepConnector, FlowchartStepCoordinates } from '../types/flowchart-step.type';
import { FlowchartRendererService } from './flowchart-renderer.service';
import { FlowchartConnectorsAnimationsConstants, FlowchartConstants } from '../helpers/flowchart-constants';
import { FlowchartStepsEnum } from '../enums/flowchart-steps.enum';

@Injectable({
  providedIn: 'root',
})
export class FlowchartConnectorsService {
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
    private flowchartRendererService: FlowchartRendererService
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
      const isCreatingConnector = connector == null;

      if (!connector) {
        connector = this.createConnector(step.id, child.id);
      }

      const stepDimensions = step.getCoordinates();
      const childDimensions = child.getCoordinates();

      this.drawPath(
        connector.path,
        stepDimensions,
        childDimensions,
        isCreatingConnector && child.type != FlowchartStepsEnum.STEP_DROPAREA
      );
    });
  }

  /**
   * Cria conector
   * @param parentId Id do pai
   * @param childId Id do filho
   */
  private createConnector(parentId: string, childId: string): FlowchartStepConnector {
    const path = this.renderer2.createElement('path', 'http://www.w3.org/2000/svg');
    this.renderer2.appendChild(this.svgCanvas, path);
    this.renderer2.setAttribute(path, 'id', `${parentId}-${childId}`);
    this.renderer2.setAttribute(path, 'data-parentId', parentId);
    this.renderer2.setAttribute(path, 'data-childId', childId);
    this.renderer2.addClass(path, FlowchartConstants.FLOWCHART_CONNECTOR_CLASS);

    if (this.shouldAnimateConnector(parentId, childId)) {
      const animateElement = this.renderer2.createElement('animate', 'http://www.w3.org/2000/svg');
      this.renderer2.setAttribute(animateElement, 'repeatCount', 'indefinite');
      this.renderer2.setAttribute(animateElement, 'attributeName', 'stroke-dashoffset');
      this.renderer2.setAttribute(animateElement, 'dur', FlowchartConnectorsAnimationsConstants.DURATION);
      this.renderer2.setAttribute(animateElement, 'values', FlowchartConnectorsAnimationsConstants.STROKE_VALUES);

      this.renderer2.setAttribute(path, 'stroke-dasharray', FlowchartConnectorsAnimationsConstants.STROKE_DASHARRAY);
      this.renderer2.appendChild(path, animateElement);
    }

    const connector = { path, parentId, childId };
    this.flowchartRendererService.addConnector(connector);

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
    childCoordinates: FlowchartStepCoordinates,
    animate?: boolean
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

    const pathLength = Math.abs(childElYTop - parentElYBottom) + Math.abs(childElXCenter - parentElXCenter);

    const finalPath = `M${parentElXCenter},${parentElYBottom} C${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${childElXCenter},${childElYTop}`;

    path.setAttribute('d', finalPath);

    if (animate) {
      path.style.strokeDashoffset = `0`;
      path.style.strokeDasharray = `${pathLength}`;

      path.animate([{ strokeDashoffset: `${pathLength}` }, { strokeDashoffset: '0' }], {
        duration: 1000,
        easing: 'ease',
      });

      setTimeout(() => {
        path.style.strokeDasharray = '0';
      }, 1000);
    }
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
      this.flowchartRendererService.removeConnector(connector);
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
  private getParentChildConnector(parentId: string, childId: string): FlowchartStepConnector {
    return this.flowchartRendererService.connectors.find(
      (connector) => connector.parentId == parentId && connector.childId == childId
    );
  }

  /**
   * Retorna se o conector deve ser animado
   */
  private shouldAnimateConnector(connectorParentId: string, connectorChildId: string): boolean {
    const childStep = this.flowchartRendererService.getStepById(connectorChildId);

    return childStep?.type == FlowchartStepsEnum.STEP_DROPAREA;
  }
}
