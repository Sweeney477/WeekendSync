# Custom SMTP Setup for Supabase Auth

Supabase's default email service is intended for testing only. It has strict rate limits (about 2 messages per hour), poor deliverability, and Outlook/Microsoft often block auth URLs from `supabase.com`. For production, configure a custom SMTP server.

## Steps

1. **Open Supabase Dashboard**
   - Go to your project → **Authentication** → **SMTP**

2. **Enable custom SMTP**
   - Turn on the custom SMTP option

3. **Choose a provider**
   - Supabase works with any SMTP-compatible service. Examples:
     - [Resend](https://resend.com/docs/send-with-supabase-smtp)
     - [Postmark](https://postmarkapp.com/developer/user-guide/send-email-with-smtp)
     - [Twilio SendGrid](https://www.twilio.com/docs/sendgrid/for-developers/sending-email/getting-started-smtp)
     - [Brevo](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP)
     - [AWS SES](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)
     - [ZeptoMail](https://www.zoho.com/zeptomail/help/smtp-home.html)

4. **Configure SMTP settings**
   - From your provider, obtain: SMTP host, port, username, password
   - Set a sender email (e.g. `no-reply@yourdomain.com`)
   - Set a sender name (e.g. "WeekendSync")

5. **Improve deliverability**
   - Set up DKIM, DMARC, and SPF for your sending domain
   - Work with your email provider’s docs to add the required DNS records

6. **Adjust rate limits**
   - After enabling custom SMTP, go to **Authentication** → **Rate Limits**
   - The default is typically 30 messages per hour; increase if needed for your usage

## Reference

- [Supabase: Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Resend: Maximize deliverability for Supabase Auth emails](https://resend.com/docs/knowledge-base/how-do-i-maximize-deliverability-for-supabase-auth-emails)
