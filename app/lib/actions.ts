'use server'
import z from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  data: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, data: true})

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  const amountInCents = amount * 100; // best practice daw
  const creationDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Insert data into database
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${creationDate})
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}