# Aerofly Landegerät

This project generates random custom missions for Aerofly FS 4 by utilizing the `custom_missions_user.tmc` file. There are multiple types of missions:

1. The tool creates missions containing [landing pattern or instrument approach procedure lessons](docs/pattern.md), which put your plane in a random location around an airport, sets time of day as well as weather, and let you figure out how to enter the landing pattern or instrument approach procedure correctly.
2. Instead of landing patterns you can also give holding patterns a try, using the [holding pattern generator](docs/holding.md). Using NDBs, VORs or fixes, you will need to find the correct entry and make the perfectly timed turns to match the holding pattern.
3. Also there is a HEMS missions generator, which will put your helicopter on a random heliport, sets time of day as well as weather, and create flight plans to nearby MedEvac locations. See the [HEMS missions generator documentation](docs/hems.md).
4. Last but not least there is an air race missions generator, which will put your aircraft in a random spot and lets you follow a random course. See the [air race missions generator documentation](docs/airrace.md).

## How to use it

This tool requires [Node.js](https://nodejs.org/en) in at least version 20 to be installed on your local computer.

The Landegerät is a Command Line Interface (CLI) tool, which means you need to open a terminal to run it. The tool itself does not need to be installed, as the Node.js tool `npx` will take care of downloading as well as executing the Landegerät.

## Technical stuff

This projects uses the public APIs of the [Aviation Weather Center](https://aviationweather.gov/). The usage of these APIs may be restricted or blocked on your local computer. The data may also be incoherent with your local state of Aerofly FS 4.

## Status

[![npm version](https://badge.fury.io/js/@fboes%2Faerofly-patterns.svg)](https://badge.fury.io/js/@fboes%2Faerofly-patterns)
[![GitHub version](https://badge.fury.io/gh/fboes%2Faerofly-patterns.svg)](https://badge.fury.io/gh/fboes%2Faerofly-patterns)
![GitHub](https://img.shields.io/github/license/fboes/aerofly-patterns.svg)

## Legal stuff

Author: [Frank Boës](https://3960.org/) 2024-2025

Copyright & license: See [LICENSE.txt](LICENSE.txt)

This tool is NOT affiliated with, endorsed, or sponsored by IPACS GbR. As stated in the [LICENSE.txt](LICENSE.txt), this tool comes with no warranty and might damage your files.

This software complies with the General Data Protection Regulation (GDPR) as it does not collect nor transmits any personal data to third parties, but for the usage of the [Aviation Weather Center API](https://aviationweather.gov/). For their data protection statement you might want to check their terms of service.
