# Aerofly Landegerät: Landing Pattern Generator

The generator creates landing patterns for practicing entries and flying the pattern.

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

```
Usage: npx @fboes/aerofly-patterns@latest ICAO_AIRPORT_CODE [AEROFLY_AIRCRAFT_CODE] [...options]
Create random custom missions for Aerofly FS 4.

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

Aircraft codes can be found at [the complete list of available internal aircraft codes in Aerofly FS 4](https://fboes.github.io/aerofly-data/data/aircraft.html). Examples of codes:

| `AEROFLY_AIRCRAFT_CODE` | Type                                 |
| ----------------------- | ------------------------------------ |
| `a320`                  | Airbus A320                          |
| `b58`                   | Beechcraft Baron 58                  |
| `c172`                  | Cessna 172                           |
| `c90gtx`                | Beechcraft King Air C90              |
| `dr400`                 | Robin DR 400                         |
| `ec135`                 | Eurocopter EC135                     |
| `uh60`                  | Sikorsky UH-60 Black Hawk            |
| `f15e`                  | McDonnell Douglas F-15E Strike Eagle |
| `jungmeister`           | Bücker Bü 133 Jungmeister            |
| `lj45`                  | Learjet 45                           |
| `mb339`                 | Aermacchi MB-339                     |
| `pitts`                 | Pitts Special S-2                    |
| `r22`                   | Robinson R22                         |

## Download the missions

There are already multiple mission files generated in [`/data`](./data/). They are stored in directories with the pattern `data/Landing_Challenges-[ICAO_AIRPORT_CODE]-[AEROFLY_AIRCRAFT_CODE]/`. These files are in each directory:

- `custom_missions_user.tmc`: Mission file with multiple emissions
- `[ICAO_AIRPORT_CODE]-[AEROFLY_AIRCRAFT_CODE].geojson`: A GeoJSON file containing the airport properties and the plane in mission #1
- `README.md`: Quick summary of all missions

See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import the missions into Aerofly FS 4.

---

For more information see the [main documentation](../README.md).
