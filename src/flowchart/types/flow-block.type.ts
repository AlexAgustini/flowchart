import { FlowchartStepsEnum } from '../enums/flowchart-steps.enum';

/**
 * Bloco de execução de fluxo
 *
 * @author Tcharles Michael Moraes
 * @since 17/07/2021
 */
export type FlowBlock = {
  /**
   * Id do bloco
   */
  blockId: string;
  /**
   * Tipo do bloco executado.
   * Veja {@link FlowBlockTypesEnum}
   */
  type: FlowchartStepsEnum;

  //#region REQUEST
  /**
   * Id da requisição que será executada pelo bloco
   */
  requestId?: string;
  //#endregion

  //#region COLLECTION_REQUEST
  /**
   * Id da coleção que a request será feita
   */
  collectionId?: string;

  /**
   * Tipo da requisição que será feita
   */
  collectionRequestType?: any;
  /**
   * Configurações da coleção. Contém as informações necessárias para extração ou inserção de dados na coleção
   */
  collectionConfigurations?: any;
  //#endregion

  //#region FLOW_REQUEST
  /**
   * Id do fluxo que será executado pela requisição
   */
  flowEndpoint?: string;
  //#endregion

  //#region SCRIPT
  /**
   * Id do script a ser executado pelo bloco
   */
  scriptId?: string;
  //#endregion

  //#region CONDITION
  /**
   * Tipo de condição quando {@link type} for igual a {@lnk FlowBlockTypesEnum.CONDITIONAL}
   */
  conditionalType?: any;
  /**
   * Composição de condição quando {@link FlowBlockConditionalTypeEnum.COMPLEX}
   */
  conditionComposition?: any;
  /**
   * Condição simples quando {@link FlowBlockConditionalTypeEnum.SIMPLE}
   */
  conditionSimple?: string;
  //#endregion

  //#region LOOP_START
  /**
   * Caminho do contexto até o valor a ser iterado quando {@link type} for igual a {@link FlowBlockTypesEnum.LOOP_START}
   */
  valueToLoopPath?: string;
  //#endregion

  //#region FINALIZATION
  /**
   * Template da mensagem exibida na finalização de um fluxo caso {@link FlowBlockTypesEnum.FINALIZATION}
   */
  lastMessage?: string;
  /**
   * Status de finalização caso {@link FlowBlockTypesEnum.FINALIZATION}
   */
  finalizationStatus?: any;
  //#endregion

  //#region FLOW EXECUTION RETURN
  /**
   * Status de retorno caso {@link FlowBlockTypesEnum.EXEUCTION_RETURN}
   */
  executionReturnStatus?: any;
  /**
   * Contexto para execução do bloco
   */
  context?: Record<string, unknown>;
  //#region FLOW_NOTIFICATION
  /**
   * Destinatários para o envio da notificação.
   */
  notificationList?: string;
  /**
   * Mensagem da notificação.
   */
  notificationMessage?: string;
  //#endregion
  /**
   * Próximos blocos da execução
   */
  nextBlocks?: { success: FlowBlock; error: FlowBlock };
  /**
   * Mapeamento de valores do bloco de execução
   */
  mappings: Record<string, unknown>;
  /**
   * Flag que define se os logs de um bloco devem ser armazenamento.
   */
  shouldRegisterLog: boolean;
  /**
   * Template de log rápido (QuickLog) para sucesso
   */
  quickLogTemplateSuccess?: string;
  /**
   * Template de log rápido (QuickLog) para erro
   */
  quickLogTemplateError?: string;
  /**
   * Objecto com parâmetros de corpo livre para retorno após a chamada do fluxo.
   */
  expectedReturnLooseBody?: string;

  /**
   * Objecto com parâmetros de corpo livre para retorno com erro após a chamada do fluxo.
   */
  expectedErrorReturnLooseBody?: string;
};
