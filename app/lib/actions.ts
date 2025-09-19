'use server'

import z from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
 
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z
    .string()
    .nonempty('Customer is required'),
  amount: z.coerce
    .number()
    .gt(0, {message: "Value has to be greater than 0"}),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Status is required',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true})
const UpdateInvoice = FormSchema.omit({ id: true, date: true})

export type State = {
  errors?: {
    customerId?: string[],
    amount?: string[],
    status?: string[],
  }
  message?: string | null;
}

export async function createInvoice(prevState: State, formData: FormData) {

  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  if(!validatedFields.success){
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
      values: {
        customerId: formData.get("customerId")?.toString() || "",
        amount: formData.get("amount")?.toString() || "",
        status: formData.get("status")?.toString() || "",
      },
    }
  }

  const {amount, customerId, status} = validatedFields.data;

  const amountInCents = amount * 100;
  const creationDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${creationDate})
    `;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error; // Re-throw the error after logging it
  }

  revalidatePath('/dashboard/invoices'); // is this just to refresh the data so it makes it look live?
  redirect('/dashboard/invoices'); // this is just to redirect back after action
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  if(!validatedFields.success){
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice."
    }
  }

  const {amount, customerId, status} = validatedFields.data;

  const amountInCents = amount * 100; // best practice daw

  try {
    await sql`
      UPDATE invoices
      SET 
        customer_id = ${customerId},
        amount = ${amountInCents},
        status = ${status}
      WHERE id = ${id}
    `;
  } catch (error){
    console.log('theres an error in updating the invoice:', error);
    return {
        message: 'Database Error: Failed to Update Invoice.',
    }
  }


  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error("failed to delete")

  await sql`
    DELETE FROM invoices
    WHERE id = ${id}
  `;

  revalidatePath('/dashboard/invoices');
}