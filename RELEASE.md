# Idiomorph Release Guide

This guide outlines how to release Idiomorph, focusing on the steps to take to prepare a release, how to publish it, and other release concerns.

## Steps

1. `npm run test:ci`
2. Update the version number in package.json
2. `npm install`
3. `npm run dist`
4. Update the documented gzipped filesize and version number in README.md
5. Update CHANGELOG.md
6. Update ROADMAP.md
7. `git add . && git commit -m"Release vX.Y.Z"`
8. `git tag vX.Y.Z`
9. `git push origin main --tags`
10. `npm publish`
11. Update the Github Releases page: https://github.com/bigskysoftware/idiomorph/releases
12. Make announcement on the htmx Discord in the #idiomorph and #announcements channels
