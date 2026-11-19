# Advancing African Research in AI and NLP: workshop website

A static site for the workshop at LAUTECH, Ogbomoso, 17–18 December 2026. It is built for GitHub Pages and needs no build step.

## Edit the content

Everything that changes lives in `data/workshop.json`:

| What | Where in the JSON |
| --- | --- |
| Title, dates, host, venue, contact email | `event` |
| Talk submission and registration links | `links.talkSubmission`, `links.registration` |
| Deadlines (shown as written) | `deadlines.talkSubmission`, `deadlines.registration` |
| Speakers: name, affiliation, role, photo | `speakers` |
| Programme for each day | `programme` |
| About cards, statistics, call for talks, outputs | `about`, `stats`, `callForTalks`, `outputs` |

Empty values are handled for you:

- An empty link shows the button as "(opens soon)" and disables it.
- An empty deadline shows "To be announced".
- An empty affiliation or venue is simply left out.
- A speaker without a `photo` gets initials. To add a photo, put it in `assets/img/` and set `"photo": "assets/img/name.jpg"`.

In the programme, a slot with `"type": "break"` is shown as a break row.

## Publish on GitHub Pages

1. Create a repository and upload these files, keeping the folder structure.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
4. Save. The site appears at `https://<username>.github.io/<repository>/` after a minute or two.

After that, any edit to `data/workshop.json` committed to `main` updates the live site.

## Preview locally

The page loads its data with `fetch`, so it must be served rather than opened as a file:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
