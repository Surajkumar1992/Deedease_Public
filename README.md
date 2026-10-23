# Deedease — Coming Soon landing page

Static, dependency-free page (`index.html`, `styles.css`, `main.js`, `logo.svg`) served by **GitHub Pages** from the root of `master`, on the GoDaddy domain **deedease.com**.

## 1. Enable GitHub Pages

1. Repo → **Settings → Pages**.
2. **Source:** *Deploy from a branch* → Branch `master`, folder `/ (root)` → **Save**.
3. **Custom domain:** `deedease.com` (already in [`CNAME`](./CNAME)) → Save.
4. After DNS resolves (step 2), tick **Enforce HTTPS**.

## 2. GoDaddy DNS (My Products → deedease.com → DNS)

Remove any existing `A`/`CNAME` records for `@` and `www` that point elsewhere (e.g. the AWS EC2 IP), then add:

| Type  | Name | Value                      |
|-------|------|----------------------------|
| A     | @    | 185.199.108.153            |
| A     | @    | 185.199.109.153            |
| A     | @    | 185.199.110.153            |
| A     | @    | 185.199.111.153            |
| AAAA  | @    | 2606:50c0:8000::153        |
| AAAA  | @    | 2606:50c0:8001::153        |
| AAAA  | @    | 2606:50c0:8002::153        |
| AAAA  | @    | 2606:50c0:8003::153        |
| CNAME | www  | `surajkumar1992.github.io` |

Also disable GoDaddy **Domain Forwarding** for the domain if enabled. DNS can take up to an hour (rarely 48h) to propagate. Keep your MX records untouched so `info@deedease.com` keeps working.

Optional (recommended): verify the domain under GitHub → **Settings (profile) → Pages → Add a domain** to prevent takeover.

## 3. Lead / waitlist forms

Both forms POST to [FormSubmit](https://formsubmit.co) (`FORM_ENDPOINT` in [`main.js`](./main.js)), which emails each lead to **info@deedease.com**.

- **First submission** sends a one-time *activation* email to info@deedease.com — click *Activate* and all later submissions are delivered.
- After activation, FormSubmit emails a random alias string; you can replace the email in `FORM_ENDPOINT` with it to hide the address from the source.
- To use Formspree/Getform/etc. instead, change only `FORM_ENDPOINT`.

Each submission includes `form_type` (`waitlist` or `lead`), plus name, email, phone, city, role, interest (Early access / Pilot partner), company and message for leads.

## Local preview

```powershell
python -m http.server 8080   # open http://localhost:8080
```
