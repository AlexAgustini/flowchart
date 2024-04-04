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
  public async initSteps(initialStep: FlowchartStep): Promise<void> {
    await this.flowchartStepsService.createStep({ pendingStep: initialStep });
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
  _id: '65df367dd80eb4482a7fef13',
  name: ' [ANYMARKET] > [SIGER] Integração de cliente',
  initialExecutionBlock: {
    blockId: 's1708970840989',
    type: 'REQUEST',
    mappings: {
      'headers->gumgaToken': '{{context.s1708970840989.environment.variables.gumgaToken}}',
      'queryParams->id': '{{context.initialExecutionContext.anymarketOrderId}}',
    },
    requestId: '65dcc91055af83611acf6bdc',
    shouldRegisterLog: false,
    nextBlocks: {
      success: {
        blockId: 's1708970862447',
        type: 'REQUEST',
        mappings: {
          'headers->Authorization': '{{context.s1708970862447.environment.variables.token}}',
          'queryParams->cpfCnpj': '{{context.s1708970840989.successResponse.body.buyer.document}}',
        },
        requestId: '65dcd17df720de5a89c2154e',
        shouldRegisterLog: false,
        nextBlocks: {
          success: {
            blockId: 's1708971496401',
            type: 'SCRIPT',
            mappings: {
              documentType: '{{context.s1708970840989.successResponse.body.buyer.documentType}}',
            },
            scriptId: '65dcd59839cf8acd58ea08d6',
            shouldRegisterLog: false,
            nextBlocks: {
              success: {
                blockId: 's1708970866501',
                type: 'CONDITION',
                conditionalType: 'COMPLEX',
                shouldRegisterLog: false,
                nextBlocks: {
                  success: {
                    blockId: 's1708970887986',
                    type: 'REQUEST',
                    mappings: {
                      'headers->Authorization': '{{context.s1708970887986.environment.variables.token}}',
                      'body->payload->code': '{{context.s1708970862447.successResponse.body.content.code}}',
                      'body->payload->subscription':
                        '{{context.s1708970862447.successResponse.body.content.subscription}}',
                      'body->payload->cgc': '{{context.s1708970862447.successResponse.body.content.cgc}}',
                      'body->payload->name': '{{context.s1708970862447.successResponse.body.content.name}}',
                    },
                    requestId: '65dcd2f439cf8acd58e9ea0e',
                    shouldRegisterLog: false,
                    nextBlocks: {
                      success: {
                        blockId: 's1708970892901',
                        type: 'EXECUTION_RETURN',
                        mappings: {
                          'return->success': 'true',
                          'return->idSiger': '{{context.s1708970887986.successResponse.body.content.0.code}}',
                        },
                        lastMessage:
                          'Cliente {{context.s1708970862447.successResponse.body.content.name}}(code:{{context.s1708970862447.successResponse.body.content.code}}) cnpj/cpf:{{context.s1708970862447.successResponse.body.content.cgc}} foi atualizando com sucesos dentro do Siger',
                        executionReturnStatus: 'SUCCESS',
                        shouldRegisterLog: false,
                        expectedReturnLooseBody: null,
                        expectedErrorReturnLooseBody: null,
                        nextBlocks: {
                          success: null,
                          error: null,
                        },
                      },
                      error: {
                        blockId: 's1708971261693',
                        type: 'EXECUTION_RETURN',
                        mappings: {
                          'return->success': 'false',
                          'return->errorMessage':
                            'Cliente {{context.s1708970862447.successResponse.body.content.name}}(code:{{context.s1708970862447.successResponse.body.content.code}}) cnpj/cpf:{{context.s1708970862447.successResponse.body.content.cgc}} não foi atualizando, erro: {{context.s1708970887986.errorResponse.body}}',
                        },
                        lastMessage:
                          'Cliente {{context.s1708970862447.successResponse.body.content.name}}(code:{{context.s1708970862447.successResponse.body.content.code}}) cnpj/cpf:{{context.s1708970862447.successResponse.body.content.cgc}} não foi atualizando, erro: {{context.s1708970887986.errorResponse.body}}',
                        executionReturnStatus: 'ERROR',
                        shouldRegisterLog: false,
                        expectedReturnLooseBody: null,
                        expectedErrorReturnLooseBody: null,
                        nextBlocks: {
                          success: null,
                          error: null,
                        },
                      },
                    },
                  },
                  error: {
                    blockId: 's1708970885302',
                    type: 'REQUEST',
                    mappings: {
                      'headers->Authorization': '{{context.s1708970885302.environment.variables.token}}',
                      'body->payload->subscription': '{{context.s1708971496401.return}}',
                      'body->payload->cgc': '{{context.s1708970840989.successResponse.body.buyer.document}}',
                      'body->payload->name': '{{context.s1708970840989.successResponse.body.buyer.name}}',
                    },
                    requestId: '65dcd009f720de5a89c1a306',
                    shouldRegisterLog: false,
                    nextBlocks: {
                      success: {
                        blockId: 's1708970895954',
                        type: 'EXECUTION_RETURN',
                        mappings: {
                          'return->success': 'true',
                          'return->idSiger': '{{context.s1708970885302.successResponse.body.content.0.code}}',
                        },
                        lastMessage:
                          'Cliente {{context.s1708970840989.successResponse.body.buyer.name}} cnpj/cpf: {{context.s1708970840989.successResponse.body.buyer.document}} email: {{context.s1708970840989.successResponse.body.buyer.email}} criando com sucesso dentro do siger.',
                        executionReturnStatus: 'SUCCESS',
                        shouldRegisterLog: false,
                        expectedReturnLooseBody: null,
                        expectedErrorReturnLooseBody: null,
                        nextBlocks: {
                          success: null,
                          error: null,
                        },
                      },
                      error: {
                        blockId: 's1708971612066',
                        type: 'EXECUTION_RETURN',
                        mappings: {
                          'return->success': 'false',
                          'return->errorMessage':
                            'Cliente {{context.s1708970840989.successResponse.body.buyer.name}} cnpj/cpf: {{context.s1708970840989.successResponse.body.buyer.document}} email: {{context.s1708970840989.successResponse.body.buyer.email}} não foi criando siger, motivo {{context.s1708970885302.errorResponse.body}}',
                        },
                        lastMessage:
                          'Cliente {{context.s1708970840989.successResponse.body.buyer.name}} cnpj/cpf: {{context.s1708970840989.successResponse.body.buyer.document}} email: {{context.s1708970840989.successResponse.body.buyer.email}} não foi criando siger, motivo {{context.s1708970885302.errorResponse.body}}',
                        executionReturnStatus: 'ERROR',
                        shouldRegisterLog: false,
                        expectedReturnLooseBody: null,
                        expectedErrorReturnLooseBody: null,
                        nextBlocks: {
                          success: null,
                          error: null,
                        },
                      },
                    },
                  },
                },
                conditionComposition: [
                  {
                    firstValue: '{{context.s1708970862447.successResponse.body.content}}',
                    comparator: '!=',
                    secondValue: 'null',
                    glue: 'AND',
                  },
                ],
              },
              error: null,
            },
          },
          error: {
            blockId: 's1708970948288',
            type: 'EXECUTION_RETURN',
            mappings: {
              'return->success': 'false',
              'return->errorMessage':
                'Erro ao tentar busca Cliente {{context.s1708970840989.successResponse.body.buyer.name}}({{context.Anymarket: Buscar pedido por id.successResponse.body.buyer.document}}), motivo: {{context.s1708970862447.errorResponse.body}}',
            },
            lastMessage:
              'Erro ao tentar busca Cliente {{context.s1708970840989.successResponse.body.buyer.name}}({{context.Anymarket: Buscar pedido por id.successResponse.body.buyer.document}}), motivo: {{context.s1708970862447.errorResponse.body}}',
            executionReturnStatus: 'ERROR',
            shouldRegisterLog: false,
            expectedReturnLooseBody: null,
            expectedErrorReturnLooseBody: null,
            nextBlocks: {
              success: null,
              error: null,
            },
          },
        },
      },
      error: {
        blockId: 's1708970901452',
        type: 'EXECUTION_RETURN',
        mappings: {
          'return->success': 'false',
          'return->errorMessage':
            'Erro ao tentar busca Anymarket {{context.initialExecutionContext.anymarketOrderId}}, motivo: {{context.s1708970840989.errorResponse.body}}',
        },
        lastMessage:
          'Erro ao tentar busca Anymarket {{context.initialExecutionContext.anymarketOrderId}}, motivo: {{context.s1708970840989.errorResponse.body}}',
        executionReturnStatus: 'ERROR',
        shouldRegisterLog: false,
        expectedReturnLooseBody: null,
        expectedErrorReturnLooseBody: null,
        nextBlocks: {
          success: null,
          error: null,
        },
      },
    },
  },
  trigger: {
    endpoint: 'anymarket-siger-integracao-de-cliente',
    hasCronTask: false,
    expectedBody: [
      {
        key: 'anymarketOrderId',
        valueType: 'STRING',
        documentation: null,
      },
    ],
    expectedReturnBody: [
      {
        key: 'success',
        valueType: 'BOOLEAN',
        documentation: null,
      },
      {
        key: 'idSiger',
        valueType: 'NUMBER',
        documentation: null,
      },
    ],
    expectedErrorReturnBody: [
      {
        key: 'success',
        valueType: 'BOOLEAN',
        documentation: null,
      },
      {
        key: 'errorMessage',
        valueType: 'STRING',
        documentation: null,
      },
    ],
    expectedReturnHeaders: [],
    isExpectedReturnLooseBody: null,
    isExpectedErrorReturnLooseBody: null,
  },
  group: 'CUSTOMERS',
  isActive: true,
  companyId: '65b8fa2168fd00df45f3b6ef',
  sameAsPublishedVersion: true,
  isInternalQualityAssured: false,
  createdAt: '2024-02-28T13:34:53.319Z',
  baseFlowId: '65dcd36639cf8acd58e9ea73',
  internalQualityAssuredUserId: null,
  updatedAt: '2024-02-28T13:34:23.293Z',
  parentVersionFlowId: '65dcd36639cf8acd58e9ea73',
  isRunning: false,
  runnerMetadata: {
    hostname: null,
    shutdownRunning: false,
  },
  executionIdsRunning: [],
  parentVersionFlow: {
    _id: '65dcd36639cf8acd58e9ea73',
    name: ' [ANYMARKET] > [SIGER] Integração de cliente',
    trigger: {
      endpoint: 'anymarket-siger-integracao-de-cliente',
      hasCronTask: false,
      expectedBody: [
        {
          key: 'anymarketOrderId',
          valueType: 'STRING',
          documentation: null,
        },
      ],
      expectedReturnBody: [
        {
          key: 'success',
          valueType: 'BOOLEAN',
          documentation: null,
        },
        {
          key: 'idSiger',
          valueType: 'NUMBER',
          documentation: null,
        },
      ],
      expectedErrorReturnBody: [
        {
          key: 'success',
          valueType: 'BOOLEAN',
          documentation: null,
        },
        {
          key: 'errorMessage',
          valueType: 'STRING',
          documentation: null,
        },
      ],
      expectedReturnHeaders: [],
      isExpectedReturnLooseBody: null,
      isExpectedErrorReturnLooseBody: null,
    },
    group: 'CUSTOMERS',
    isActive: true,
    companyId: '65b8fa2168fd00df45f3b6ef',
    sameAsPublishedVersion: false,
    isInternalQualityAssured: false,
    createdAt: '2024-02-26T18:07:34.332Z',
    baseFlowId: '65dcd36639cf8acd58e9ea73',
    internalQualityAssuredUserId: null,
    updatedAt: '2024-02-28T13:34:53.317Z',
    version: 1,
    versionDescription: null,
    isRunning: false,
    runnerMetadata: {
      hostname: null,
      shutdownRunning: false,
    },
    executionIdsRunning: [],
  },
  lastPublishedVersion: 1,
};
