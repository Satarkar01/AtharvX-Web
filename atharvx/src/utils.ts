/**
 * Secure password hashing using Web Crypto API
 */
export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * LocalStorage Database Helpers
 */
export const DB = {
  getUsers: (): any[] => {
    const users = localStorage.getItem('atharvx_users');
    return users ? JSON.parse(users) : [];
  },
  saveUsers: (users: any[]) => {
    localStorage.setItem('atharvx_users', JSON.stringify(users));
  },
  getLogs: (): any[] => {
    const logs = localStorage.getItem('atharvx_logs');
    return logs ? JSON.parse(logs) : [];
  },
  addLog: (log: any) => {
    const logs = DB.getLogs();
    logs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...log
    });
    localStorage.setItem('atharvx_logs', JSON.stringify(logs));
  },
  getOrders: (): any[] => {
    const orders = localStorage.getItem('atharvx_orders');
    return orders ? JSON.parse(orders) : [];
  },
  saveOrders: (orders: any[]) => {
    localStorage.setItem('atharvx_orders', JSON.stringify(orders));
  }
};
