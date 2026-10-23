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

Both forms POST to [Web3Forms](https://web3forms.com), which emails each lead to **info@deedease.com**.

1. Go to <https://web3forms.com>, enter `info@deedease.com` → **Create Access Key**. The key is emailed to that inbox.
2. Paste it into `WEB3FORMS_ACCESS_KEY` at the top of [`main.js`](./main.js), then commit & push.
3. (Optional) In the Web3Forms dashboard, restrict the key to `deedease.com` so it can't be reused elsewhere. The access key is designed to be public.

Until a key is set, or if a submission fails, users see a **"Send by email instead"** link that opens a pre-filled email to info@deedease.com, so no lead is lost. Failures are logged in the browser console with the server's message.

Each email includes the form type (Waitlist / Early access / pilot lead), the page URL, and for leads: name, email, phone, city, role, interest (Early access / Pilot partner), company and message. Reply-to is set to the submitter's email.

## Local preview

```powershell
python -m http.server 8080   # open http://localhost:8080
```
