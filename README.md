# Aerofly Landegerät

> Create landing pattern lessons for Aerofly FS 4.

This nice little project generates `custom_missions_user.tmc` to use with Aerofly FS 4. These missions contain landing pattern lessons, which put your plane in a random location around an airport, sets time of day as well as weather, and let you figure out how to enter the landing pattern correctly.

## What does it do?

1. It downloads data for an airport selected by you,
2. and places an aircraft selected by you in a random spot around this airport,
3. considering an optional Minimum Safe Altitude.
4. It downloads METAR weather data for the last few days,
5. and determines which will be the active runway by taking a look at the wind (or using a default runway if there is almost no wind)
6. considering if your aircraft is able to land on this runway.
7. From this data it will create multiple random missions,
8. and write these to a `custom_missions_user.tmc` which you then can use in Aerofly FS 4.

## How to use it

This tool requires [Node.js](https://nodejs.org/en) in at least version 20 to be installed on your local computer.

Use this CLI command to automatically download the tool and generate a new mission file in the current folder.

```
Usage: npx @fboes/aerofly-patterns ICAO_AIRPORT_CODE [AEROFLY_AIRCRAFT_CODE] [...options]
Create landing pattern lessons for Aerofly FS 4.

Arguments:
  ICAO_AIRPORT_CODE         ICAO airport code which needs to be available in Aerofly FS 4.
  AEROFLY_AIRCRAFT_CODE     Internal aircraft code in Aerofly FS 4.

Options:
  --right-pattern=..        Comma-separated list of runway names with right-turn pattern.
                            Example value: 24,33
  --min-altitude=..         Minimum safe altitude of aircraft, in 100ft MSL. At least airport elevation.
                            Default value: 0
                            Example value: 145
  --missions=..             Number of missions in file.
                            Default value: 10
  --distance=..             Initial aircraft distance from airport in Nautical Miles.
                            Default value: 8
  --pattern-altitude=..     Pattern altitude in ft AGL. For MSL see `--pattern-altitude-msl`
                            Default value: 1000
  --pattern-distance=..     Pattern distance from airport runway in Nautical Miles.
                            Default value: 1
  --pattern-final-distance=..  Pattern final distance from airport runway edge in Nautical Miles.
                            Default value: 1
  --rnd-heading=..          Randomized aircraft heading deviation from direct heading to airport in degree.
                            Default value: 0
  --prefer-rwy=..           Comma-separated list of runway names which are preferred if wind is indecisive.
                            Example value: 24,33
  --pattern-altitude-msl, -m  Pattern altitude is in MSL instead of AGL
  --directory, -d           Create files in a subdirectory instead of current directory.
  --geojson, -g             Create a GeoJSON file.
  --readme, -r              Create a `README.md`.
  --help, -h                Will output the help.
```

Example:

```bash
npx @fboes/aerofly-patterns@latest KMVY c172 --right-pattern 24,33
```

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

This tool is NOT affiliated with, endorsed, or sponsored by IPACS GbR. As stated in the [LICENSE.txt](LICENSE.txt), this tool comes with no warranty and might damage your files.

This software complies with the General Data Protection Regulation (GDPR) as it does not collect nor transmits any personal data to third parties, but for the usage of the [Aviation Weather Center API](https://aviationweather.gov/). For their data protection statement you might want to check their terms of service.
