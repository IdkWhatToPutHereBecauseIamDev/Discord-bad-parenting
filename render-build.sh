#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# This command downloads a compatible browser for Puppeteer on Render
npx puppeteer browsers install chrome
