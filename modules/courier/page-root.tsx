import { redirect } from 'next/navigation';
import { verifyCourier } from './actions/auth';
import CourierDashboardClient from './components/CourierDashboardClient';
import { getCourierDeliveriesAction } from './actions/deliveries';

export default async function CourierRoot() {
  try {
    const { user } = await verifyCourier();
    const initialDeliveries = await getCourierDeliveriesAction();

    return (
      <CourierDashboardClient 
        user={user} 
        initialDeliveries={initialDeliveries} 
      />
    );
  } catch (e) {
    redirect('/auth/login');
  }
}
