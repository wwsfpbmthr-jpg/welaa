import {paymentConfig} from '@/lib/payment-rules';
export const dynamic='force-dynamic';
export async function GET(){return Response.json(paymentConfig(process.env),{headers:{'Cache-Control':'no-store'}})}
