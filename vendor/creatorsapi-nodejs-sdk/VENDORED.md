# Vendored: Amazon Creators API Node.js SDK

Amazon distributes its official Node.js SDK as a zip, not on npm:
https://affiliate-program.amazon.com/creatorsapi/docs/en-us/get-started/using-sdk
(`creatorsapi-nodejs-sdk.zip`, package `@amzn/creatorsapi-nodejs-sdk` v1.3.0, Apache-2.0).

This folder holds the SDK's `dist/` output, built unmodified from that zip with its own
Babel config (`npm install && npm run build`), plus its LICENSE and NOTICE. Only runtime
dependency: `superagent`.

To update: download the latest zip, run `npm install && npm run build` inside it, and
copy `dist/`, `LICENSE.txt`, `NOTICE.txt` and `README.md` here; bump the version below.
