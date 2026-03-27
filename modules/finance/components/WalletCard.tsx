import React from 'react';

interface WalletProps {
  balance: number;
  currency: string;
  transactions: any[];
}

export const WalletCard = ({ balance, currency, transactions }: WalletProps) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="mb-4">
        <p className="text-sm text-gray-500">الرصيد المتاح</p>
        <h2 className="text-3xl font-bold text-primary">
          {balance.toLocaleString()} <span className="text-lg font-normal">{currency}</span>
        </h2>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm font-semibold border-b pb-2">آخر العمليات</p>
        {transactions?.map((tx) => (
          <div key={tx.id} className="flex justify-between text-sm">
            <span className="text-gray-600">{tx.description || 'عملية نظام'}</span>
            <span className={tx.type === 'revenue' ? 'text-green-600' : 'text-red-600'}>
              {tx.type === 'revenue' ? '+' : '-'}{tx.amount}
            </span>
          </div>
        ))}
        {(!transactions || transactions.length === 0) && (
          <p className="text-xs text-gray-400 text-center py-2">لا توجد عمليات مؤخرًا</p>
        )}
      </div>
    </div>
  );
};
