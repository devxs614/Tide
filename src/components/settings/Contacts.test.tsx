// v2.3 Item 2 in the screens: the phone field takes digits only (with a
// polite note), the country decides the rule and the preview, an invalid
// number blocks only its own save, WhatsApp shows only when chosen, and a
// number the migration couldn't read raises the review banner and turns
// off its Call and Message buttons. Then the whole path: a contact added in
// Settings has the right links on Support.
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { getSettings } from '@/lib/repo/settings';
import { renderApp, resetApp } from '@/test/utils';
import { PeopleSection } from './PeopleSection';
import { TrustedContacts } from '@/components/safety/ContactList';

describe('phone contacts', () => {
  it('drops letters as you type and says so once', async () => {
    await resetApp();
    const { user } = await renderApp(<PeopleSection />);
    const form = await screen.findByRole('group', { name: 'Add contact' });
    const number = within(form).getByLabelText('Phone number');
    expect(number).toHaveAttribute('type', 'tel');
    expect(number).toHaveAttribute('inputmode', 'numeric');
    await user.type(number, 'abc123');
    expect(number).toHaveValue('123');
    expect(screen.getByText('Only numbers here. The country code is set on the left.')).toBeInTheDocument();
  });

  it('follows the country for the rule and the preview, and blocks only an invalid save', async () => {
    await resetApp();
    const { user } = await renderApp(<PeopleSection />);
    const form = await screen.findByRole('group', { name: 'Add contact' });
    await user.type(within(form).getByLabelText('Name'), 'Sofi');
    await user.selectOptions(within(form).getByLabelText('Country code'), '52');
    await user.type(within(form).getByLabelText('Phone number'), '81123');
    await user.click(screen.getByRole('button', { name: 'Add contact' }));
    expect(await screen.findByText('This number needs 10 digits.')).toBeInTheDocument();
    expect(within(form).getByLabelText('Phone number')).toHaveAttribute('aria-invalid', 'true');
    expect((await getSettings()).trustedContacts).toHaveLength(0);
    await user.type(within(form).getByLabelText('Phone number'), '45678');
    expect(screen.getByText('Will call: +52 81 1234 5678')).toBeInTheDocument();
    await user.click(screen.getByLabelText('This number has WhatsApp'));
    await user.click(screen.getByRole('button', { name: 'Add contact' }));
    await waitFor(async () =>
      expect((await getSettings()).trustedContacts[0]).toMatchObject({ name: 'Sofi', method: 'phone', countryCode: '52', national: '8112345678', value: '+528112345678', whatsapp: true }),
    );
  });

  it('a handle still takes letters', async () => {
    await resetApp();
    const { user } = await renderApp(<PeopleSection />);
    await user.type(await screen.findByLabelText('Name'), 'Mo');
    await user.selectOptions(screen.getByLabelText('How to reach them'), 'handle');
    await user.type(screen.getByLabelText('Number or handle'), '@mo.k');
    await user.click(screen.getByRole('button', { name: 'Add contact' }));
    await waitFor(async () => expect((await getSettings()).trustedContacts[0]).toMatchObject({ method: 'handle', value: '@mo.k' }));
  });

  it('Support links use the clean number, and WhatsApp only when chosen', async () => {
    await resetApp({
      trustedContacts: [
        { id: 'a', name: 'Sofi', method: 'phone', value: '+528112345678', countryCode: '52', national: '8112345678', whatsapp: true },
        { id: 'b', name: 'Dad', method: 'phone', value: '+15551234567', countryCode: '1', national: '5551234567' },
      ],
    });
    await renderApp(<TrustedContacts />);
    expect(await screen.findByRole('link', { name: 'Call Sofi' })).toHaveAttribute('href', 'tel:+528112345678');
    expect(screen.getByRole('link', { name: 'Message Sofi' })).toHaveAttribute('href', 'sms:+528112345678');
    expect(screen.getByRole('link', { name: 'WhatsApp Sofi' })).toHaveAttribute('href', 'https://wa.me/528112345678');
    expect(screen.getByRole('link', { name: 'Call Dad' })).toHaveAttribute('href', 'tel:+15551234567');
    expect(screen.queryByRole('link', { name: 'WhatsApp Dad' })).not.toBeInTheDocument();
  });

  it('a number to review raises the banner and turns its buttons off', async () => {
    await resetApp({ trustedContacts: [{ id: 'a', name: 'Mom', method: 'phone', value: 'call mom 811', needsReview: true }] });
    const { user } = await renderApp(
      <>
        <PeopleSection />
        <TrustedContacts />
      </>,
    );
    expect(await screen.findByText("One contact's number may not work. Review it.")).toBeInTheDocument();
    const list = screen.getAllByRole('listitem').find((li) => within(li).queryByText('Mom') && within(li).queryByRole('button', { name: /Call/ }))!;
    expect(within(list).getByRole('button', { name: /Call/ })).toBeDisabled();
    expect(within(list).getByText('Fix the number to call or text.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Review Mom' }));
    expect(screen.getByText('Saved as: call mom 811')).toBeInTheDocument();
  });
});
