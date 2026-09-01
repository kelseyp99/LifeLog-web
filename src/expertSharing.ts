import {httpsCallable} from 'firebase/functions';
import {functions} from './firebaseConfig';

export type ShareStatus = 'active' | 'revoked';

export interface ShareTokenRecord {
  tokenId: string;
  ownerUid: string;
  expertUid: string;
  expertName: string;
  categories: string[];
  shareAllCategories?: boolean;
  createdAt: string;
  expiresAt: string;
  status: ShareStatus;
  revokedAt: string | null;
}

export interface ExpertShareSummary extends ShareTokenRecord {
  ownerDisplayName: string;
}

export interface SharedActivityRecord {
  id: string;
  category: string;
  description: string;
  summary: string;
  timestamp: string | null;
  cleared: string;
  type: string;
  sourceType: string;
}

export interface ExpertNote {
  id: string;
  text: string;
  expertUid?: string;
  expertName?: string;
  createdAt: string;
}

export async function callExpertWorkflow<T>(
  action: string,
  data: Record<string, unknown> = {}
): Promise<T> {
  const workflow = httpsCallable(functions, 'expertWorkflowApi');
  const result = await workflow({action, ...data});
  return result.data as T;
}
