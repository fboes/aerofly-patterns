# Aerofly Landegerät: Holding Pattern Generator

> Create random custom missions for Aerofly FS 4.

The generator creates holding patterns for practicing entries and flying the pattern. See ["Holding" at Code 7700](https://www.code7700.com/holding.htm) and ["Holding Pattern" at SKYBrary Aviation Safety](https://skybrary.aero/articles/holding-pattern)

## What does it do?

1. The Landegerät gets data for a VOR / NDB…
2. …and creates a holding pattern.
3. Depending on your configuration it may also use a DME fix.
4. In the last step some real weather is added…
5. …and a random starting location for your aircraft.

## How to use it

This tool requires [Node.js](https://nodejs.org/en) (at least version 20) to be installed on your local computer.

The Landegerät is a Command Line Interface (CLI) tool, which means you need to open a terminal to run it. The tool itself does not need to be installed, as the Node.js tool `npx` will take care of downloading as well as executing the Landegerät.

## CLI usage

```
Usage: npx @fboes/aerofly-patterns@latest aerofly-holding NAVAID_CODE [AFS_AIRCRAFT_CODE] [AFS_LIVERY_CODE] [...options]
v2.6.1: Landegerät - Create random custom missions for Aerofly FS 4.

Arguments:
  NAVAID_CODE               NavAid code which is holding fix. Needs to be available in Aerofly FS 4.
                            Default value: GND
  AFS_AIRCRAFT_CODE         Internal aircraft code in Aerofly FS 4.
                            Default value: c172
  AFS_LIVERY_CODE           Internal livery code in Aerofly FS 4.

Options:
  --inbound-heading=..      Heading of inbound leg in degrees. Default is -1, meaning that the inbound leg will be random.
                            Default value: -1
                            Example value: 180
  --min-altitude=..         Minimum safe altitude of aircraft, in 100ft MSL. '100' means 10,000ft MSL.
                            Default value: 100
  --max-altitude=..         Maximum altitude of aircraft, in 100ft MSL. '0' means that the minimum altitude will be used.
                            Default value: 0
                            Example value: 200
  --min-dme-dist=..         Minimum DME distance in Nautical Miles.
                            Default value: 5
  --max-dme-dist=..         Maximum DME distance in Nautical Miles.
                            Default value: 10
  --missions=..             Number of missions in file.
                            Default value: 10
  --distance=..             Initial aircraft distance from holding fix in Nautical Miles.
                            Default value: 5
  --left-probability=..     Probability of an left-hand pattern being used in the mission.
                            Default value: 0.1
  --dme-probability=..      Probability of an DME procedure being used in the mission.
                            Default value: 0.1
  --dme-holding-toward-probability=..  Probability of an DME procedure holding toward the navaid instead of away from.
                            Default value: 0.5
  --no-guides               Try to remove virtual guides from missions.
  --directory, -d           Create files in a subdirectory instead of current directory.
  --help, -h                Will output the help.
```

## Download the missions

There are already multiple mission files generated in [`/data`](./data/). They are stored in directories with the pattern `data/Holding_Pattern-[NAVAID_CODE]-[AFS_AIRCRAFT_CODE]/`.

See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import the missions into Aerofly FS 4.

---

For more information see the [main documentation](../README.md).
