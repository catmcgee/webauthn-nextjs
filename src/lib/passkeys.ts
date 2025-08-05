export type Passkey = {
  id: string;            
  publicKey: Uint8Array; 
  counter: number;
};

const store = new Map<string, Passkey[]>();    
const regChal = new Map<string, string>();      
const authChal = new Map<string, string>();    

export const db = { store, regChal, authChal };
