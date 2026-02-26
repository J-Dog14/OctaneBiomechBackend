# Skeleton Data - Clean Readable View

## Overview

- Top-level keys: 8
- Top-level key names: bones, frames, labels, endTime, segments, frameRate, startTime, uncroppedLength
- Bone connections: 36

## Bone Connections

| # | From | To |
|---:|---|---|
| 1 | HeadFront | HeadL |
| 2 | HeadFront | HeadR |
| 3 | HeadL | SpineThoracic2 |
| 4 | HeadR | SpineThoracic2 |
| 5 | SpineThoracic2 | SpineThoracic12 |
| 6 | SpineThoracic12 | WaistBack |
| 7 | WaistBack | WaistLFront |
| 8 | WaistLFront | LThighFrontLow |
| 9 | LThighFrontLow | LKneeOut |
| 10 | LKneeOut | LShinFrontHigh |
| 11 | LShinFrontHigh | LAnkleOut |
| 12 | LHeelBack | LForefoot2 |
| 13 | LForefoot2 | LForefoot5 |
| 14 | WaistBack | WaistRFront |
| 15 | WaistRFront | RThighFrontLow |
| 16 | RThighFrontLow | RKneeOut |
| 17 | RKneeOut | RShinFrontHigh |
| 18 | RShinFrontHigh | RAnkleOut |
| 19 | RHeelBack | RForefoot2 |
| 20 | RForefoot2 | RForefoot5 |
| 21 | LShoulderTop | LElbowOut |
| 22 | LElbowOut | LElbowIn |
| 23 | LElbowOut | LWristOut |
| 24 | LWristOut | LWristIn |
| 25 | LWristOut | LHand2 |
| 26 | RShoulderTop | RElbowOut |
| 27 | RElbowOut | RElbowIn |
| 28 | RElbowOut | RWristOut |
| 29 | RWristOut | RWristIn |
| 30 | RWristOut | RHand2 |
| 31 | Mound_Lt_Rear | Mound_Rt_Rear |
| 32 | Mound_Lt_Rear | Mound_Lt_Front |
| 33 | Mound_Rt_Rear | Mound_Rt_Front |
| 34 | Mound_Lt_Front | Mound_Rt_Front |
| 35 | Mound_Rt_Front | Mound_Rt_Bottom |
| 36 | Mound_Lt_Front | Mound_Lt_Bottom |

## frames

- Type: list
- Length: 587
- First item type: dict
- First item keys: force, frame, markers, segmentPos, segmentRot

## labels

- Type: list
- Length: 39
- First item type: dict
- First item keys: name

## endTime

- Value: `9.08`

## segments

- Type: list
- Length: 16
- First item type: dict
- First item keys: name, length

## frameRate

- Value: `300`

## startTime

- Value: `7.126667`

## uncroppedLength

- Value: `10.447`

## Notes

- Full prettified payload saved to `SKELETON_DATA_PRETTY.json`.
- This report preserves structure while making key sections easier to scan quickly.
