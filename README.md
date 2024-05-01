# Aerofly Landegerät

> Create landing pattern lessons for Aerofly FS 4.

This nice little project generates `custom_missions_user.tmc` to use with Aerofly FS 4. These missions contain landing pattern lessons, which put your plane in a random location around an airport, sets time of day as well as weather, and let you figure out how to enter the landing pattern correctly.

## What does it do?

1. It downloads data for an airport selected by you,
2. and places an aircraft selected by you in a random spot around this airport.
3. It downloads METAR weather data for the last few days,
4. and determines which will be the active runway,
5. considering if your aircraft is able to land on this runway.
6. From this data it will create multiple random missions,
7. and write these to a `custom_missions_user.tmc` which you then can use in Aerofly FS 4.

## How to use it

This tool requires [Node.js](https://nodejs.org/en) in at least version 20 to be installed on your local computer.

Use this CLI command to generate a new mission file in the current folder.

```bash
# npx @fboes/aerofly-patterns [ICAO_AIRPORT_CODE] [AEROFLY_AIRCRAFT_CODE] [RP_RUNWAY,..]
npx @fboes/aerofly-patterns KMVY c172 24,33
```

| Parameter               | Description                                                                     | Example | Default |
| ----------------------- | ------------------------------------------------------------------------------- | ------- | ------- |
| `ICAO_AIRPORT_CODE`     | ICAO airport code which needs to be available in Aerofly FS 4                   | `KMVY`  | `KMVY`  |
| `AEROFLY_AIRCRAFT_CODE` | Internal aircraft code in Aerofly FS 4                                          | `c172`  | `c172`  |
| `RP_RUNWAY`             | Comma-separated list of runway names with right-turn pattern                    | `24,33` |         |
| `FOLDER_MODE`           | If set to `1` will create files in a subdirectory instead of current directory. | `1`     |         |

If you need to skip a parameter, supply `-` and it will use the default value.

The complete list of available internal aircraft codes in Aerofly FS 4 is available in `…\Aerofly FS 4 Flight Simulator\aircraft`. Improved flight planning is available for aircraft listed in [`dist/data/AeroflyAircraft.js`](./dist/data/AeroflyAircraft.js). Examples of codes:

| `AEROFLY_AIRCRAFT_CODE` | Type                                 |
| ----------------------- | ------------------------------------ |
| `a320`                  | Airbus A320                          |
| `b58`                   | Beechcraft Baron 58                  |
| `c172`                  | Cessna 172                           |
| `c90gtx`                | Beechcraft King Air C90              |
| `ec135`                 | Eurocopter EC135                     |
| `f15e`                  | McDonnell Douglas F-15E Strike Eagle |
| `jungmeister`           | Bücker Bü 133 Jungmeister            |
| `lj45`                  | Learjet 45                           |
| `mb339`                 | Aermacchi MB-339                     |
| `pitts`                 | Pitts Special S-2                    |
| `r22`                   | Robinson R22                         |

## Download the missions

There are already multiple mission files generated in [`/data`](./data/). They are stored in directories with the pattern `data/[ICAO_AIRPORT_CODE]-[AEROFLY_AIRCRAFT_CODE]/`. These files are in each directory:

- `custom_missions_user.tmc`: Mission file with multiple emissions
- `[ICAO_AIRPORT_CODE]-[AEROFLY_AIRCRAFT_CODE].geojson`: A GeoJSON file containing the airport properties and the plane in mission #1
- `README.md`: Quick summary of all missions

See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import the missions into Aerofly FS 4.

## Technical stuff

This projects uses the public APIs of the [Aviation Weather Center](https://aviationweather.gov/). The usage of these APIs may be restricted or blocked on your local computer. The data may also be incoherent with your local state of Aerofly FS 4.

## Status

[![npm version](https://badge.fury.io/js/@fboes%2Faerofly-patterns.svg)](https://badge.fury.io/js/@fboes%2Faerofly-patterns)
[![GitHub version](https://badge.fury.io/gh/fboes%2Faerofly-patterns.svg)](https://badge.fury.io/gh/fboes%2Faerofly-patterns)
![GitHub](https://img.shields.io/github/license/fboes/aerofly-patterns.svg)

## Legal stuff

Author: [Frank Boës](https://3960.org/) 2024

Copyright & license: See [LICENSE.txt](LICENSE.txt)
