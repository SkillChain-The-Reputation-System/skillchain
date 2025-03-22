import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard'); // Redirects to the dashboard as the first page
}