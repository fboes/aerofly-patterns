# Aerofly Landegerät

> Landing Pattern Lessons for Aerofly FS 4.

This nice little project generates `custom_missions_user.tmc` to use with Aerofly FS 4. These missions contain landing pattern lessons, which put your plane in a random location around an airport, sets time of day as well as weather, and let you figure out how to enter the landing pattern correctly.

## How to use it

After installing this tool, use this CLI command to generate a new mission file:

```bash
# npm start [ICAO_AIRPORT_CODE] [AEROFLY_AIRCRAFT_CODE] [RP_RUNWAY,..]
npm start KMVY C172 24,33
```

Missions will be generated in `data/Landing_Challenges-[ICAO_AIRPORT_CODE]-[AEROFLY_AIRCRAFT_CODE]/`.

### `AEROFLY_AIRCRAFT_CODE`

Working examples for `AEROFLY_AIRCRAFT_CODE`:

| `AEROFLY_AIRCRAFT_CODE` | Type                      |
| -------------------- | ------------------------- |
| `c172`               | Cessna 172                |
| `b58`                | Beechcraft Baron 58       |
| `jungmeister`        | Bücker Bü 133 Jungmeister |
| `pitts`              | Pitts Special S-2         |
| `c90gtx`             | Beechcraft King Air C90   |

### `RP_RUNWAY`

You may want to supply a list of runways with right-turn patterns, as the API does not know about these. Please supply a comma-separated list like `24,33` without any blank spaces in between.

## Download the missions

There are already multiple mission files generated in [`/data`](./data/). They are stored in directories with the pattern `data/[ICAO_AIRPORT_CODE]-[AEROFLY_AIRCRAFT_CODE]/`. These files are in each directory:

- `custom_missions_user.tmc`: Mission file with multiple emissions
- `[ICAO_AIRPORT_CODE]-[AEROFLY_AIRCRAFT_CODE].geojson`: A GeoJSON file containing the airport properties and the plane in mission #1
- `README.md`: Quick summary of all missions

See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import the missions into Aerofly FS 4.

## Technical stuff

This projects uses the public APIs of the [Aviation Weather Center](https://aviationweather.gov/). The usage of these APIs may be restricted or blocked on your local computer. The data may also be incoherent with your local state of Aerofly FS 4.

## Legal stuff

Author: [Frank Boës](https://3960.org/) 2024

Copyright & license: See [LICENSE.txt](LICENSE.txt)
