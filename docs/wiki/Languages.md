# Languages

English is built into the script. Every other language is a JSON file next to the script, named
`joinfs-ground-height-<locale>.json`:

| Code | Language |
|---|---|
| `en` | English (in the script) |
| `de` | Deutsch |
| `es` | Español |
| `fr` | Français |
| `it` | Italiano |
| `ko` | 한국어 |
| `nl` | Nederlands |
| `pt` | Português |
| `uk` | Українська |

These are the languages JoinFS itself ships, plus Ukrainian.

![German on a light page](images/demo-light-de.png)

## How the language is chosen

1. the element's **`lang` attribute**, which is observed: set it at any time and everything re-renders;
2. otherwise the **browser's languages** (`navigator.languages`), the first supported one wins;
3. otherwise English.

A regional tag is reduced to its main part (`de-AT` becomes `de`, `pt-BR` becomes `pt`). The component does not read the
page's URL; the demo maps a `?lang=` parameter onto the attribute.

## Hosting the files

The files are fetched lazily, once per language, from the folder of the script (or from the folder named by the
`locale-base` attribute). If a file cannot be fetched (for instance when the page is opened from `file://`) a warning with
the address goes to the console and the chart stays in English.

## Adding or correcting a translation

Edit the table in `tools/make-locales.cjs` and run `npm run locales`. `npm test` checks that every file has exactly the
keys and placeholders of the English dictionary. Words around a placeholder are written as a sentence around a plain noun
or number (*Lowest height above ground: {value}*), because placeholders cannot be declined. German uses the informal "du".
The translations other than German are first drafts; corrections are welcome.
