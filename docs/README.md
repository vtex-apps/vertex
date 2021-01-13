# VERTEX
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

The VERTEX Tax Calculator app integrates VTEX checkout and OMS with VERTEX's real-time tax calculation service. It is possible to calculate taxes based on the item being bought, the inventory addresses, and the shipping address.

## Functionalities
- Calculation of shopping cart taxes
- Commit these taxes in the VERTEX system at the time the order is invoiced (optional)

## Configuration

1. [Install](https://vtex.io/docs/recipes/development/installing-an-app/) the VERTEX app by running `vtex install vtex.vertex` in your terminal.

## How to configure
After installing the app, head over to the Admin under 'Other' section and access the Vertex app. Then fill in your VERTEX credentials.
Once you save, it will be active at the checkout flow, if there's another Tax app running, you'll see a confirmation message asking your permission to overwrite the current tax configuration.
