export interface Profile {
  id: string;
  email: string;
  plan_tier: 'free' | 'pro';
}

// Ensure this says 'AppEvent', NOT 'Event'
export interface AppEvent {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  is_published: boolean;
  registrations?: Registration[];
}

export interface Registration {
  id: string;
  event_id: string;
  attendee_name: string;
  attendee_email: string;
  payment_status: 'pending' | 'paid';
  amount_paid: number;
  created_at: string;
}