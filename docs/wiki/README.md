# Wiki sources

These pages are the wiki of the component. They live in the repository so they are versioned with the code. Links use the
GitHub wiki style (`[text](Page-Name)`, no extension): browse them in the wiki, not in this folder.

## Publish to the GitHub wiki

GitHub keeps a wiki in a separate repository (`<repo>.wiki.git`) that exists after the first page has been created in the
web interface (enable the wiki under Settings, then "Create the first page" on the Wiki tab).

```sh
git clone git@github.com:joeherwig/joinfs-ground-height-webcomponent.wiki.git ../joinfs-ground-height-webcomponent.wiki
cp docs/wiki/*.md ../joinfs-ground-height-webcomponent.wiki/
cp -r docs/wiki/images ../joinfs-ground-height-webcomponent.wiki/
rm ../joinfs-ground-height-webcomponent.wiki/README.md
cd ../joinfs-ground-height-webcomponent.wiki && git add -A && git commit -m "Update wiki" && git push
```

The screenshots were taken from `demo/index.html` with its made-up flight and terrain (dark page, then a light page in German).
