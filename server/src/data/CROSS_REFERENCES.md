# Cross-reference attribution

`crossReferences.json` is generated from the OpenBible.info Bible Cross References dataset.

- Source: https://www.openbible.info/labs/cross-references/
- Download: https://a.openbible.info/data/cross-references.zip
- Licence: Creative Commons Attribution 4.0 (CC BY 4.0)
- Primary underlying source: the public-domain *Treasury of Scripture Knowledge*
- Retrieved for this project: 2026-08-23 (source file dated 2026-08-17)

The generated file contains canonical references and ranking votes only. It contains no ESV verse text; displayed quotations always come from Nkwa Bible's local World English Bible or Asante Twi datasets.

Regenerate with:

```bash
cd server
npm run import:cross-references -- /path/to/cross_references.txt
```
