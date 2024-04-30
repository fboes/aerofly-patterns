# Aerofly Landegerät

> Landing Pattern Lessons for Aerofly FS 4.

This nice little project generates `custom_missions_user.tmc` to use with Aerofly FS 4. These missions contain landing pattern lessons, which put your plane in a random location around an airport, sets time of day as well as weather, and let you figure out how to enter the landing pattern correctly.

## How to use it

After installing this tool, use this CLI command to generate a new mission file in the current folder.

```bash
# npm start [ICAO_AIRPORT_CODE] [AEROFLY_AIRCRAFT_CODE] [RP_RUNWAY,..]
npm start KMVY c172 24,33
```

| Parameter               | Description                                                   | Example | Default |
| ----------------------- | ------------------------------------------------------------- | ------- | ------- |
| `ICAO_AIRPORT_CODE`     | ICAO airport code which needs to be available in Aerofly FS 4 | `KMVY`  | `KMVY`  |
| `AEROFLY_AIRCRAFT_CODE` | Internal aircraft code in Aerofly FS 4                        | `c172`  | `c172`  |
| `RP_RUNWAY`             | Comma-separated list of runway names with right-turn pattern  | `24,33` |         |

If you need to skip a parameter, supply `-` and it will use the default value.

The complete list of available internal aircraft codes in Aerofly FS 4 is available in `…\Aerofly FS 4 Flight Simulator\aircraft`. Examples of codes:

| `AEROFLY_AIRCRAFT_CODE` | Type                                 |
| ----------------------- | ------------------------------------ |
| `a320`                  | Airbus A320                          |
| `asg29`                 | Schleicher ASG 29                    |
| `b58`                   | Beechcraft Baron 58                  |
| `b737`                  | Boeing 737                           |
| `b737_900`              | Boeing 737-900                       |
| `b777_300er`            | Boeing 777                           |
| `c172`                  | Cessna 172                           |
| `c90gtx`                | Beechcraft King Air C90              |
| `camel`                 | Sopwith Camel                        |
| `concorde`              | Aérospatiale-BAC Concorde            |
| `dr1`                   | Fokker Dr.I                          |
| `ec135`                 | Eurocopter EC135                     |
| `f15e`                  | McDonnell Douglas F-15E Strike Eagle |
| `f4u`                   | Vought F4U Corsair                   |
| `jungmeister`           | Bücker Bü 133 Jungmeister            |
| `lj45`                  | Learjet 45                           |
| `mb339`                 | Aermacchi MB-339                     |
| `p38`                   | Lockheed P-38                        |
| `pitts`                 | Pitts Special S-2                    |
| `q400`                  | De Havilland DHC-8                   |
| `r22`                   | Robinson R22                         |
| `swift`                 | Aériane Swift                        |

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
