export const generateThermalReceipt = (order: any, items: any[]) => {
  return `
    --- ${order.tenant_name} ---
    Date: ${new Date().toLocaleString()}
    Order ID: #${order.id.substring(0,6)}
    --------------------------
    ${items.map(i => `${i.name} x${i.quantity} = ${i.price * i.quantity}`).join('\n')}
    --------------------------
    Total: ${order.total} EGP
    Thank you for shopping!
  `;
}
