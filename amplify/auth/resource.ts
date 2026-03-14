import { referenceAuth } from '@aws-amplify/backend';

export const auth = referenceAuth({
  userPoolId: 'us-east-1_ef9pmhpQq',
  userPoolClientId: '76h0ov3f9tb3jvbaiurc7qsq9p',
  identityPoolId: 'us-east-1:b12fb4d7-fcd0-42ce-9ff0-1b0cd9fa972d',
  authRoleArn: 'arn:aws:iam::274815321855:role/amplify-d2jawpaet8g6c9-am-amplifyAuthauthenticatedU-3QosvDZEQmfJ',
  unauthRoleArn: 'arn:aws:iam::274815321855:role/amplify-d2jawpaet8g6c9-am-amplifyAuthunauthenticate-JgOG3lp32qm3',
});
