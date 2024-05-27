# Changelog

- Added approximate alignment for water runways
- Added extra cloud layers

## 2.2.0

- Added navigational aids to GeoJSON
- Improved GeoJSON output
- Added TPA configuration
- Added simple mechanism to determine right pattern
- Improved support for helipads
- Improved support for "L"/"R" runways

## 2.1.2

- Improved altitude calculation for glide slope
- Improved output of geographic vectors
- Added vector output to navigational aids
- Added feet debugging output in `custom_missions_user.tmc`
- Added `.npmignore`

## 2.1.1

- Added randomized heading for aircraft
- Added configurable pattern distance

## 2.1.0

- Added preferred runway for (almost) no wind conditions
- Added field elevation output
- Improved wind description output
- Added CLI parameters for GeoJSON / `README.md`

## 2.0.0

- Changed CLI parameters

## 1.3.1

- Improved naming of airports
- Improved handling of missing weather data

## 1.3.0

- Added `MINIMUM_SAFE_ALTITUDE` parameters
- Added correct flight level separation
- Aircraft without VOR receivers get a different briefing

## 1.2.0

- Added improved Airport database with ILS frequencies, right turn patterns
- Added support for local frequencies (tower / CTAF)
- Changed altitude of pattern waypoints
- Improved documentation

## 1.1.3

- Added crosswind component calculator
- Changed runway length output to meters

## 1.1.2

- Added `Degree` helper
- Updated C172 landing challenges
- Improved unknown aircraft fallback handling
- Improved documentation generator

## 1.1.1

- Fixed aircraft database

## 1.1.0

- Added CLI help via `--help`
- Added folder mode, which creates all files in a subdirectory
- Added some missions
- Added functionality to generate flight plans for unknown aircraft

## 1.0.0

- Initial release
