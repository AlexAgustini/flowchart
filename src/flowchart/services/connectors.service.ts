import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { FlowchartStepComponent } from '../components/flowchart-step-component/flowchart-step.component';
import {
  FlowchartStepConnector,
  FlowchartStepCoordinates,
} from '../types/flowchart-step.type';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ConnectorsService {
  private svg: SVGElement;

  private readonly renderer2: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer2 = rendererFactory.createRenderer(null, null);
  }

  registerSvg(svg: SVGElement) {
    this.svg = svg;
  }

  drawConnectors(step: FlowchartStepComponent) {
    if (!step) return;

    step.children.forEach((child) => {
      let connector = this.getParentChildConnector(step.connectors, child.id);
      if (!connector) {
        connector = this.createConnector(step, child.id);
      }

      const stepDimensions = step.getCoordinates();
      const childDimensions = child.getCoordinates();

      this.drawPath(connector, stepDimensions, childDimensions);
    });
  }

  createConnector(
    parentStep: FlowchartStepComponent,
    childId: string
  ): SVGPathElement {
    const path = this.renderer2.createElement(
      'path',
      'http://www.w3.org/2000/svg'
    );
    this.renderer2.appendChild(this.svg, path);
    this.renderer2.setAttribute(path, 'id', `${parentStep.id}-${childId}`);

    parentStep.connectors?.push({ path, childId });

    return path;
  }

  drawPath(
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

  clearAllOldConnectors(step: FlowchartStepComponent) {
    if (!step) return;

    const parentConnectors = step.parent?.connectors || [];
    const childConnectors = step.connectors || [];

    console.log(parentConnectors);
    console.log(childConnectors);

    const removeConnector = (connector: FlowchartStepConnector) => {
      this.renderer2.removeChild(this.svg, connector.path);
    };

    parentConnectors
      .filter((connector) => connector.childId == step.id)
      .forEach((connector, i) => {
        parentConnectors.splice(i, 1);
        removeConnector(connector);
      });

    childConnectors.forEach(removeConnector);
  }

  private getParentChildConnector(
    parentConnectors: Array<FlowchartStepConnector>,
    childId: string
  ): SVGPathElement {
    return parentConnectors?.find((connector) => connector.childId == childId)
      ?.path;
  }
}
