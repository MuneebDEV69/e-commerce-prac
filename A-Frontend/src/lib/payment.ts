/**
 * Payment methods + the account details customers transfer to.
 */
export type PaymentMethod = 'COD' | 'CARD' | 'BANK' | 'JAZZCASH' | 'EASYPAISA'

export type PaymentOption = {
  value: PaymentMethod
  label: string
  /** Account the customer pays into. Omitted for COD (nothing to pay up-front). */
  account?: { lines: { label: string; value: string }[]; note: string }
}

const HOLDER = 'Muhammad Muneeb Arif'
const WALLET_NUMBER = '03254467765'

// TODO(owner): replace Bank + Account/IBAN with your real bank details.
const BANK_ACCOUNT = {
  lines: [
    { label: 'Account Holder', value: HOLDER },
    { label: 'Bank', value: 'Habib Bank Limited' },
    { label: 'Account / IBAN', value: 'PK00XXXX0000000000000000' }
  ],
  note: 'Transfer the total to this bank account, then enter your transaction ID below. We verify and confirm your order.'
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { value: 'COD', label: 'Cash on Delivery (COD)' },
  { value: 'CARD', label: 'Debit / Credit Card (via bank transfer)', account: BANK_ACCOUNT },
  {
    value: 'JAZZCASH',
    label: 'JazzCash',
    account: {
      lines: [
        { label: 'Account Holder', value: HOLDER },
        { label: 'JazzCash Number', value: WALLET_NUMBER }
      ],
      note: 'Send the total via JazzCash to this number, then enter the JazzCash Transaction ID (TID) or your sending number below.'
    }
  },
  {
    value: 'EASYPAISA',
    label: 'EasyPaisa',
    account: {
      lines: [
        { label: 'Account Holder', value: HOLDER },
        { label: 'EasyPaisa Number', value: WALLET_NUMBER }
      ],
      note: 'Send the total via EasyPaisa to this number, then enter the EasyPaisa Transaction ID (TID) or your sending number below.'
    }
  }
]

export const paymentLabel = (m: string) => PAYMENT_OPTIONS.find((o) => o.value === m)?.label ?? m
