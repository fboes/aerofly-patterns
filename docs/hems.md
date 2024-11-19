# Aerofly Landegerät: Helicopter Emergency Medical Services

> Create random custom missions Aerofly FS 4.

This nice little project generates `custom_missions_user.tmc` to use with Aerofly FS 4. The HEMS version of this tool generates random Helicopter Emergency Medical Services (HEMS) missions.

## What does it do?

1. Prepare a GeoJSON file (see below)
   1. …which contains heliports (to start from)
   2. …emergency locations (to fly to).
   3. …and hospitals (to end your mission)
2. Start the actual Landegerät tool.
   1. The Landegerät will create multiple missions, set on different days and at a different time.
   2. It will randomly select a heliport, an emergency site, and a hospital.
   3. Finally it will fetch METAR weather data for the given location and date.
   4. Optionally the Landegerät creates a Point of Interest (POI) file, which will contain cars and persons for every emergency site.
3. These missions will be written to a `custom_missions_user.tmc` which you then can use in Aerofly FS 4.
   1. If you also created a POI file, you will need to put this into your Aerofly FS 4 `scenery/poi` directory.

## How to use it

This tool requires [Node.js](https://nodejs.org/en) in at least version 20 to be installed on your local computer.This tool requires [Node.js](https://nodejs.org/en) in at least version 20 to be installed on your local computer.

The Landegerät is a Command Line Interface (CLI) tool, which means you need to open a terminal to run it. The tool itself does not need to be installed, as the Node.js tool `npx` will take care of downloading as well as executing the Landegerät.

### CLI usage

```
Usage: npx -p @fboes/aerofly-patterns@latest aerofly-hems GEOJSON_FILE [AFS_AIRCRAFT_CODE] [AFS_LIVERY_CODE] [...options]
Create landing pattern lessons for Aerofly FS 4.

Arguments:
  GEOJSON_FILE              GeoJSON file containing possible mission locations.
  AFS_AIRCRAFT_CODE         Internal aircraft code in Aerofly FS 4. Defaults to "ec135".
  AFS_LIVERY_CODE           Internal aircraft code in Aerofly FS 4. Defaults to "adac".

Options:
  --metar-icao=.., -m=..    Use this ICAO station code to find weather reports
                            Example value: EHAM
  --missions=..             Number of missions in file.
                            Default value: 10
  --callsign=..             Optional callsign, else default callsign will be used.
  --no-guides               Try to remove virtual guides from missions.
  --cold-dark               Start cold & dark.
  --transfer, -t            Mission types can also be transfers.
  --poi, -p                 Generate POI files in sub directory.
  --directory, -d           Create files in a subdirectory instead of current directory.
  --help, -h                Will output the help.
```

See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import the missions into Aerofly FS 4.

As of present there are three helicopters in Aerofly FS 4:

| `AEROFLY_AIRCRAFT_CODE` | Type                      |
| ----------------------- | ------------------------- |
| `ec135`                 | Eurocopter EC135          |
| `uh60`                  | Sikorsky UH-60 Black Hawk |
| `r22`                   | Robinson R22              |

## The GeoJSON file

The mission generator needs a [GeoJSON file](https://geojson.org/) which contains all possible locations to be used in the missions. At the base of this file it needs a `FeatureCollection`, in which a list of `Feature` locations need to be put.

There are three types of `Feature` locations:

- **Heliports** as a possible starting point for your helicopter; at least one is required.
- **Hospitals** as a possible end point to return at the end of your mission. If no hospital is given, the heliport will be used as hospital instead.
- All other locations are considered to be **emergency sites**.

This project contains example GeoJSON files, which will help you build your own missions source file.

1. [Lüneburg](../dist/data/hems/lueneburg.geojson) (open in [geojson.io](https://geojson.io/#data=data:text/x-url,https%3A%2F%2Fraw.githubusercontent.com%2Ffboes%2Faerofly-patterns%2Frefs%2Fheads%2Fdevelop%2Fdist%2Fdata%2Fhems%2Flueneburg.geojson))
2. [San Francisco](../dist/data/hems/san_francisco.geojson) (open in [geojson.io](https://geojson.io/#data=data:text/x-url,https%3A%2F%2Fraw.githubusercontent.com%2Ffboes%2Faerofly-patterns%2Frefs%2Fheads%2Fdevelop%2Fdist%2Fdata%2Fhems%2Fsan_francisco.geojson))

![geojson.io example](./geojson-io.png)

> [geojson.io](https://geojson.io/) is a free online editor for creating and modifying GeoJSON files. It allows for adding, editing and deleting GeoJson `Feature` locations on an interactive map, as well as editing the properties of each `Feature`. It also will display icons matching the `marker-symbol`.

To create the different types of locations, you will need to add properties to every GeoJSON `Feature`. Find the list of properties below:

### Heliports

| Property                   | Type     | Description                        |
| -------------------------- | -------- | ---------------------------------- |
| `properties.marker-symbol` | `string` | `heliport`                         |
| `properties.title`         | `string` | Name of location                   |
| `properties.icaoCode`      | `string` | ICAO code                          |
| `properties.direction`     | `number` | Optional orientation of helicopter |

### Hospital

| Property                   | Type     | Description      |
| -------------------------- | -------- | ---------------- |
| `properties.marker-symbol` | `string` | `hospital`       |
| `properties.title`         | `string` | Name of location |
| `properties.icaoCode`      | `string` | ICAO code        |

### Emergency site

| Property                   | Type     | Description                     |
| -------------------------- | -------- | ------------------------------- |
| `properties.marker-symbol` | `string` | see below, or can be left empty |
| `properties.title`         | `string` | Name of location                |
| `properties.direction`     | `number` | Optional orientation of POI     |

There are special marker symbols for emergency sites, which :

| `marker-symbol`     | Missions         | Points of Interest                  |
| ------------------- | ---------------- | ----------------------------------- |
| default             | Patient recovery | Spawn an ambulance and a police car |
| `car`               | Car accident     | Spawns a car accident scene         |
| `ship`, `ferry`     | Ship SAR         | Spawns a ship                       |
| `person`, `cricket` | Lost person      | Spawns a single person              |

## Using the POI file

If you want to the "Landegerät: HEMS" can generate POI files for you. This file contains positions for cars, persons and other objects to be present at every emergency site.

You will need to copy the generated POI folder to your Aerofly FS 4 user directory, and there to `scenery/poi`.

> Idea donated by [ApfelFlieger](https://www.aerofly.com/community/forum/index.php?thread/23415-searching-for-simple-method-to-add-stock-objects-to-scenery/&postID=150121#post150121).

---

For more information like possible helicopter codes see the [main documentation](../README.md).
