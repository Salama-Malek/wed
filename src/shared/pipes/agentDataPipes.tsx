interface TransformedData {
    mandateSource: string;
    agentName: string;
    identityNumber: string;
    identityTypeName: string;
    mandateStatus: string;
  }
  
  export function transformAgentData(data: any): TransformedData {
    const mandateSource = data?.Agent?.MandateSource || '';
    const agentName = data?.Agent?.AgentName || '';
    const mandateStatus = data?.Agent?.MandateStatus || '';
    
    const identityNumber = data?.Agent?.AgentDetails?.[0]?.IdentityNumber || '';
    
    const identityTypeName = data?.PartyList?.[0]?.IdentityTypeName || '';
  
    return {
      mandateSource,
      agentName,
      identityNumber,
      identityTypeName,
      mandateStatus
    };
  }