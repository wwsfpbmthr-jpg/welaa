import { CreditCard } from 'lucide-react';

export function PaymentMark({ method }: { method: 'card' | 'promptpay' }) {
  return <span className={'payment-brand-mark ' + method} aria-hidden="true">
    {method === 'card' ? <CreditCard size={32} strokeWidth={1.5}/> : <img src="/icons/promptpay.png" alt="" width={643} height={216}/>}
  </span>;
}
