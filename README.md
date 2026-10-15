# Riyas E K — Portfolio

Zero-dependency static site (HTML, CSS, JS). No build step.

## Deploy on Vercel (2 minutes)

**Option A — Dashboard**
1. Push this folder to a new GitHub repo (or drag the folder into vercel.com/new).
2. Vercel → Add New → Project → import the repo.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Deploy.

**Option B — CLI**
```
npm i -g vercel
cd riyas-portfolio
vercel --prod
```

## After the first deploy
Name the project `riyas-ek` so the URL is https://riyas-ek.vercel.app.
If the URL is different, find/replace `https://riyas-ek.vercel.app` in `index.html`
(canonical, Open Graph and JSON-LD tags) so LinkedIn/WhatsApp previews show `og.png`.

## Edit content
- Text and sections: `index.html`
- Console demo commands, UAE sectors, incident steps, CV text: `app.js`
- Colours and fonts: variables at the top of `styles.css`
- Resume PDF: replace `Riyas-EK-Resume.pdf` (keep the filename)

## Add a photo (optional)
Add `riyas.jpg` and swap the `RE` badge in the nav/hero for an `<img>`.
