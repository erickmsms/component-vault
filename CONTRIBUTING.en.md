# Contributing

[Português](CONTRIBUTING.md) · **English**

Contributions are welcome! Everything goes in through a **pull request**: nobody pushes directly to `main`.

By participating, you agree to follow the [code of conduct](CODE_OF_CONDUCT.md).

## How to contribute

1. Fork the repository and create a branch from `main`.
2. Install and run the showcase:

   ```bash
   npm install
   npm run dev
   ```

3. Make your change. For a new component, follow ["Adding a component"](README.en.md#adding-a-component) in the README and the thumbnail rules in [`docs/previews.md`](docs/previews.md) (in Portuguese).
4. Before opening the PR, run:

   ```bash
   npm run lint
   npm run check:previews
   npm run build
   ```

5. Open the pull request against `main` and fill in the template's checklist.

CI runs these same checks on every PR, and Vercel builds a preview of the site for review.

## What goes in

Only **generic** components, usable in any project: everything comes in through props, with no copy or rules from the source project, and styling comes from Tailwind classes and the theme tokens. Details in ["What goes into the library"](README.en.md#what-goes-into-the-library).

Fixes, showcase improvements and new themes are welcome too. For big changes, open an issue first so we can discuss it.

## License

By contributing, you agree that your contribution will be distributed under the project's [MIT license](LICENSE).
