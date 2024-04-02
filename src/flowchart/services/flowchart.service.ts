import { ElementRef, Injectable, ViewContainerRef } from '@angular/core';
import { FlowchartStepsService } from './flowchart-steps.service';
import { FlowchartRendererService } from './flowchart-renderer.service';
import { FlowchartStep } from '../types/flowchart-step.type';
import { FlowchartConnectorsService } from './flowchart-connectors.service';

@Injectable({
  providedIn: 'root',
})
export class FlowchartService {
  /**
   * Serviço de steps
   */
  private readonly flowchartStepsService: FlowchartStepsService;
  /**
   * Serviço renderer do flow
   */
  private readonly flowchartRendererService: FlowchartRendererService;
  /**
   * Serviço de conectores
   */
  private readonly connectorsService: FlowchartConnectorsService;

  constructor(
    flowchartStepsService: FlowchartStepsService,
    flowchartRendererService: FlowchartRendererService,
    connectorsService: FlowchartConnectorsService
  ) {
    this.flowchartStepsService = flowchartStepsService;
    this.flowchartRendererService = flowchartRendererService;
    this.connectorsService = connectorsService;
  }

  /**
   * Inicia o flowchart
   * @param initialStep Step inicial
   */
  public initSteps(initialStep: FlowchartStep): void {
    this.flowchartStepsService.createStep({ pendingStep: initialStep });
  }

  /**
   * Registra flowchart
   * @param flowchartViewContainer Container do flowchart
   * @param flowchartElement Elemento do flowchart
   * @param svgCanvas Svg utilizado para renderizar conectores
   */
  public initFlowchart(
    flowchartViewContainer: ViewContainerRef,
    flowchartElement: ElementRef<HTMLDivElement>,
    svgCanvas: ElementRef<SVGElement>
  ): void {
    this.connectorsService.registerSvg(svgCanvas.nativeElement);
    this.flowchartRendererService.registerFlowchart(flowchartViewContainer, flowchartElement, svgCanvas);
    this.flowchartStepsService.registerFlowchart(flowchartViewContainer, flowchartElement);
  }
}

export const flowB = {
  _id: '65c134ec4711510681e738a4',
  name: 'BuscaCep',
  initialExecutionBlock: {
    blockId: 's1707160361322',
    type: 'COLLECTION_REQUEST',
    collectionId: '65c12312b31490856fdc8778',
    collectionRequestType: 'FIND_ALL',
    collectionConfigurations: {
      query: {
        queryGlue: 'AND',
        conditions: [],
      },
    },
    shouldRegisterLog: false,
    nextBlocks: {
      success: {
        blockId: 's1707160410382',
        type: 'LOOP_START',
        valueToLoopPath: '{{context.s1707160361322.successResponse.body.result}}',
        shouldRegisterLog: false,
        nextBlocks: {
          success: {
            blockId: 's1707160483967',
            type: 'SCRIPT',
            mappings: {
              cep: '{{context.s1707160410382.current.CEP}}',
            },
            scriptId: '65c132acc703adb29955b866',
            shouldRegisterLog: false,
            nextBlocks: {
              success: {
                blockId: 's1707160557270',
                type: 'REQUEST',
                mappings: {
                  'queryParams->cep': '{{context.s1707160483967.return}}',
                },
                requestId: '6509e7bb21f3e809529fdb5e',
                shouldRegisterLog: false,
                nextBlocks: {
                  success: {
                    blockId: 's1707160618160',
                    type: 'CONDITION',
                    conditionalType: 'COMPLEX',
                    shouldRegisterLog: false,
                    nextBlocks: {
                      success: {
                        blockId: 's1707160708464',
                        type: 'COLLECTION_REQUEST',
                        collectionId: '65c123d6c703adb29954ce99',
                        collectionRequestType: 'INSERT',
                        collectionConfigurations: {
                          body: {
                            ID: null,
                            CEP: '{{context.s1707160557270.successResponse.body.cep}}',
                            Descrição: '{{context.s1707160557270.successResponse.body.uf}}',
                          },
                        },
                        shouldRegisterLog: false,
                        nextBlocks: {
                          success: {
                            blockId: 's1707160799391',
                            type: 'FINALIZATION',
                            finalizationStatus: 'SUCCESS',
                            shouldRegisterLog: false,
                            nextBlocks: {
                              success: null,
                              error: null,
                            },
                          },
                          error: null,
                        },
                      },
                      error: {
                        blockId: 's1707160684359',
                        type: 'FINALIZATION',
                        finalizationStatus: 'SUCCESS',
                        shouldRegisterLog: false,
                        nextBlocks: {
                          success: null,
                          error: null,
                        },
                      },
                    },
                    conditionComposition: [
                      {
                        comparator: '==',
                        glue: 'AND',
                        firstValue: '{{context.s1707160557270.successResponse.body.uf}}',
                        secondValue: 'PR',
                      },
                    ],
                  },
                  error: null,
                },
              },
              error: null,
            },
          },
          error: null,
        },
      },
      error: null,
    },
  },
  trigger: {
    endpoint: 'buscacep',
    hasCronTask: false,
    expectedBody: null,
    expectedReturnBody: null,
    expectedErrorReturnBody: null,
    expectedReturnHeaders: null,
    isExpectedReturnLooseBody: null,
    isExpectedErrorReturnLooseBody: null,
  },
  group: 'TESTE',
  isActive: true,
  companyId: '62e03754b896c6bc8a5f3975',
  sameAsPublishedVersion: false,
  isInternalQualityAssured: false,
  createdAt: '2024-02-05T19:20:12.048Z',
  baseFlowId: '65c134ec4711510681e738a4',
};
