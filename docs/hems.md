# Aerofly Landegerät: Helicopter Emergency Medical Services

> Create random custom missions Aerofly FS 4.

This nice little project generates `custom_missions_user.tmc` to use with Aerofly FS 4.

## What does it do?

1. You will have to supply a GeoJSON file
2. which contains locations with `heliport`, `hospital`
3. and other locations, which will serve as locations to fly to.
4. If the `heliport` location has now known ICAO code as `title`, you may want to supply an extra ICAO code to fetch weather for.
5. The Landegerät downloads METAR weather data for the last few days.
6. From this data it will create multiple random missions
7. which will place the helicopter in one of the `heliport` locations and
8. will require you to fly to the emergency site and afterwards to `hospital` location.
9. These missions will be written to a `custom_missions_user.tmc` which you then can use in Aerofly FS 4.

## How to use it

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

## The GeoJSON file

The mission generator needs a [GeoJSON file](https://geojson.org/) which contains all possible locations to be used in the missions. At the base of this file it needs a `FeatureCollection`, in which a list of `Feature` locations need to be put.

There are three types of `Feature` locations:

- `heliport` as a possible starting point for your helicopter; at least one is required.
- `hospital` as a possible end point to return at the end of your mission. If none is given, the `heliport` will be used as hospital instead.
- All other types of locations will be treated as emergency sites you are able to fly to.

This project contains an [example GeoJSON file for Lüneburg](../dist/data/hems/lueneburg.geojson) and [San Francisco](../dist/data/hems/san_francisco.geojson) which will help you build your own missions source file. [geojson.io](https://geojson.io/) is a wonderful editor for creating and modifying GeoJSON files.

![geojson.io example](./geojson-io.png)

### Heliports

| Property                   | Type     | Description                        |
| -------------------------- | -------- | ---------------------------------- |
| `properties.marker-symbol` | `string` | `heliport`                         |
| `properties.title`         | `string` | Aerofly code of heliport           |
| `properties.icaoCode`      | `string` | ICAO code                          |
| `properties.direction`     | `number` | Optional orientation of helicopter |

### Hospital

| Property                   | Type     | Description                                     |
| -------------------------- | -------- | ----------------------------------------------- |
| `properties.marker-symbol` | `string` | `hospital`                                      |
| `properties.title`         | `string` | Name of hospital to be used in mission briefing |
| `properties.icaoCode`      | `string` | ICAO code                                       |

### Emergency site

| Property                   | Type     | Description                                          |
| -------------------------- | -------- | ---------------------------------------------------- |
| `properties.marker-symbol` | `string` | any but `heliport` or `hospital`                     |
| `properties.title`         | `string` | Title of mission, e.g. "Car accident on Main Street" |

## Using the POI file

If you want to the "Landegerät: HEMS" can generate POI files for you. This file contains positions for an ambulance and a police car to be present at every emergency site. Idea donated by [ApfelFlieger](https://www.aerofly.com/community/forum/index.php?thread/23415-searching-for-simple-method-to-add-stock-objects-to-scenery/&postID=150121#post150121).

You will need to copy the generated POI folder to your Aerofly FS 4 user directory, and there to `scenery/poi`.

---

For more information like possible helicopter codes see the [main documentation](../README.md).
