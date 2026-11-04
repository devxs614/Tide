// Words for phone numbers in contacts and campus support (v2.3 spec 7).
// Settings, Support and onboarding use them; Today doesn't, so they stay
// out of its first load.
export const contactsCopy = {
  phoneCountry: 'Country code',
  phoneOtherCode: 'Other code',
  phoneOther: 'Other',
  phoneNumber: 'Phone number',
  phoneOnlyNumbers: 'Only numbers here. The country code is set on the left.',
  phoneWillCall: 'Will call: {formatted}',
  phoneNeedsDigits: 'This number needs {n} digits.',
  phoneTooShort: 'That looks too short for a phone number.',
  phoneHasWhatsApp: 'This number has WhatsApp',
  contactCall: 'Call',
  contactText: 'Text',
  contactWhatsApp: 'WhatsApp',
  contactWhatsAppName: 'WhatsApp {name}',
  contactReview: "One contact's number may not work. Review it.",
  contactSavedAs: 'Saved as: {value}',
  reviewContact: 'Review {name}',
  contactActionsDisabled: 'Fix the number to call or text.',
  readNumber: 'Read the number aloud',
  saveChanges: 'Save changes',
} as const;
