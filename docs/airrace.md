# Aerofly Landegerät: Air race

> Create random custom missions for Aerofly FS 4.

This nice little project generates `custom_missions_user.tmc` to use with Aerofly FS 4. The air race version of this tool generates random air race missions.

## What does it do?

1. The Landegerät reads a GeoJSON file (see below)
1. …which contains heliports (to start from)
1. …emergency locations (to fly to).
1. …and hospitals (to end your mission).
1. The Landegerät will create multiple missions,
1. …set on different days and at a different time
1. …with randomly selected heliports, emergency sites, and a hospitals.
1. Finally it will fetch METAR weather data for the given location and date,
1. …and export these missions to a `custom_missions_user.tmc` which you then can use in Aerofly FS 4.
1. …as well as Point of Interest (POI) files, which will contain cars and persons for every emergency site.

## How to use it

This tool requires [Node.js](https://nodejs.org/en) (at least version 20) to be installed on your local computer.

The Landegerät is a Command Line Interface (CLI) tool, which means you need to open a terminal to run it. The tool itself does not need to be installed, as the Node.js tool `npx` will take care of downloading as well as executing the Landegerät.

### CLI usage

```
Usage: npx -p @fboes/aerofly-patterns@latest aerofly-airrace ICAO_AIRPORT_CODE [AFS_AIRCRAFT_CODE] [AFS_LIVERY_CODE] [...options]
v2.5.4: Landegerät - Create random custom missions for Aerofly FS 4.

Arguments:
  ICAO_AIRPORT_CODE         ICAO airport code for fetching weather and as fallback starting location.
                            Default value: KROW
  AFS_AIRCRAFT_CODE         Internal aircraft code in Aerofly FS 4.
                            Default value: pitts
  AFS_LIVERY_CODE           Internal livery code in Aerofly FS 4.

Options:
  --missions=..             Number of missions in file.
                            Default value: 10
  --starting-location=.., -l=..  ICAO airport code for starting location. The original airport code will be used for weather fetching only.
  --min-checkpoints=..      Minimum number of checkpoints.
                            Default value: 1
  --max-checkpoints=..      Maximum number of checkpoints.
                            Default value: 5
  --min-angle=..            Minimum course change per checkpoints in degree.
                            Default value: 15
  --max-angle=..            Maximum course change per checkpoints in degree.
                            Default value: 90
  --min-leg-dist=..         Minimum distance between checkpoints in kilometers.
                            Default value: 1
  --max-leg-dist=..         Maximum distance between checkpoints in kilometers.
                            Default value: 5
  --min-alt=..              Minimum altitude in feet. '0' will use the airport altitude + 1500ft.
                            Default value: 0
  --max-alt=..              Maximum altitude in feet. '0' will use the airport altitude + 3500ft.
                            Default value: 0
  --directory, -d           Create files in another directory instead of current directory.
  --help, -h                Will output the help.
```

Example:

```bash
# https://www.soaringspot.com/de/olmue-chile-marzo-olmue-2025/tasks/open/task-6-on-2025-03-25
npx -p @fboes/aerofly-patterns@latest aerofly-airrace SCVM asg29 --min-checkpoints=2 --max-checkpoints=10 \
  --min-angle=30 --max-angle=120 \
  --min-leg-dist=3 --max-leg-dist=30 \
  -d
```

Aircraft codes can be found at [the complete list of available internal aircraft codes in Aerofly FS 4](https://fboes.github.io/aerofly-data/data/aircraft.html).


## Download the missions

There are already multiple mission files generated in [`/data`](./data/). They are stored in directories with the pattern `data/airrace-[LOCATION_NAME]-[AEROFLY_AIRCRAFT_CODE]/`.

See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import the missions into Aerofly FS 4.

---

For more information see the [main documentation](../README.md).
