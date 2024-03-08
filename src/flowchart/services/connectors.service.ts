import {
  Inject,
  Injectable,
  Injector,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import {
  Flow,
  FlowchartStepConnector,
  FlowchartStepCoordinates,
} from '../types/flowchart-step.type';
import { FlowchartService } from './flowchart.service';

@Injectable({
  providedIn: 'root',
})
export class ConnectorsService {
  private svgCanvas: SVGElement;

  private readonly renderer2: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    injector: Injector,
    private flowchartService: FlowchartService
  ) {
    this.renderer2 = rendererFactory.createRenderer(null, null);
  }

  public registerSvg(svg: SVGElement) {
    this.svgCanvas = svg;
  }

  public drawConnectors(step: FlowchartStepComponent) {
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
    this.addPathListener(path);

    const connector = { path, parentId, childId };
    this.flowchartService.addConnector(connector);

    return connector;
  }

  private drawPath(
    path: SVGPathElement,
    parentCoordinates: FlowchartStepCoordinates,
    childCoordinates: FlowchartStepCoordinates
  ) {
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

  public clearDestroyedStepConnectors(step: FlowchartStepComponent) {
    if (!step) return;

    this.removeConnector(step.parent?.id, step.id);
    step.children.forEach((child) => this.removeConnector(step.id, child.id));
  }

  public removeConnector(childId: string, parentId: string) {
    const connector = this.getParentChildConnector(childId, parentId);
    if (!connector) return;
    try {
      this.flowchartService.removeConnector(connector);
      this.renderer2.removeChild(this.svgCanvas, connector.path);
    } catch (e) {
      console.log(e);
    }
  }

  private getParentChildConnector(
    parentId: string,
    childId: string
  ): FlowchartStepConnector {
    return this.flowchartService.connectors.find(
      (connector) =>
        connector.parentId == parentId && connector.childId == childId
    );
  }

  private addPathListener(path: SVGPathElement) {
    this.renderer2.listen(path, 'dragenter', (e) => this.onDragEnter(e));
    this.renderer2.listen(path, 'dragleave', (e) => this.onDragLeave());
  }

  private onDragEnter(e: DragEvent) {
    const path = e.target as SVGPathElement;
    const dimensions = path.getBoundingClientRect();
    // const { x, y } = this.flowchartService.getPointXYRelativeToFlowchart({
    //   x: dimensions.x,
    //   y: dimensions.y,
    // });

    // const xMiddle = dimensions.width / 2;
    // const yMiddle = dimensions.height / 2;
  }

  private onDragLeave() {}
}
