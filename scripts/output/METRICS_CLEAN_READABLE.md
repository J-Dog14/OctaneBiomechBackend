# Swing Metrics - Clean Readable View

## Timing

| Variable (verbatim key) | Value |
|---|---:|
| `PROCESSED.Frame_rate` | 300 fps |
| `TIMING.ContactTime` | 0.606667 s |
| `TIMING.ContactTime_pct` | 0.8584908 |
| `TIMING.DownswingTime` | 0.4300003 s |
| `TIMING.DownswingTime_pct` | 0.6084908 |
| `TIMING.Lead_Foot_DownTime` | 0.4733338 s |
| `TIMING.Lead_Foot_DownTime_pct` | 0.6698118 |

## Peak Timing Markers

| Variable (verbatim key) | Time (s) | Time (%) |
|---|---:|---:|
| `TIMING.Max_Bat_Ang_VelTime` | 0.576667 | 0.8160378 |
| `TIMING.Max_Bat_Lin_VelTime` | 0.576667 | 0.8160378 |
| `TIMING.Max_Pelvis_Ang_VelTime` | 0.536667 | 0.7594341 |
| `TIMING.Max_Pelvis_Lin_VelTime` | 0.5300003 | 0.7500002 |
| `TIMING.Max_Thorax_Ang_VelTime` | 0.5333337 | 0.7547172 |
| `TIMING.Max_Thorax_Lin_VelTime` | 0.4200003 | 0.5943398 |
| `TIMING.Max_Lead_Hand_Ang_VelTime` | 0.5433336 | 0.7688681 |
| `TIMING.Max_Lead_Hand_Lin_VelTime` | 0.5300003 | 0.7500002 |
| `TIMING.Max_Lead_Forearm_Ang_VelTime` | 0.5300003 | 0.7500002 |
| `TIMING.Max_Lead_Elbow_Ext_Ang_VelTime` | 0.7033336 | 0.995283 |
| `TIMING.Max_Lead_Elbow_Sup_Ang_VelTime` | 0.5000004 | 0.7075474 |
| `TIMING.Max_Trail_Elbow_Ext_Ang_VelTime` | 0.4833337 | 0.6839625 |
| `TIMING.Max_Trail_Elbow_Pron_Ang_VelTime` | 0.686667 | 0.9716982 |

## Plane / Bat Angles

| Variable (verbatim key) | Value |
|---|---:|
| `PLANE.Vertical_attack_angle` | 6.278774 |
| `PLANE.Horizontal_attack_angle` | 13.3572 |
| `PLANE.Bat_Angle_Frontal@Contact` | 51.6466 |
| `PLANE.Bat_Angle_Sagittal@Contact` | -12.87339 |
| `PLANE.Bat_Angle_Transversal@Contact` | 169.7495 |

## Key Velocity & Distance Metrics

| Variable (verbatim key) | Value |
|---|---:|
| `PROCESSED.Max_Bat_Ang_Vel` | 2065.279 |
| `PROCESSED.Max_Bat_Linear_Vel` | 27.458 |
| `PROCESSED.Max_Pelvis_Ang_Vel` | 691.1498 |
| `PROCESSED.Max_Thorax_Ang_Vel` | 905.8898 |
| `PROCESSED.Max_Lead_Hand_Ang_Vel` | 1419.947 |
| `PROCESSED.Max_Lead_Forearm_Ang_Vel` | 1187.921 |
| `PROCESSED.Max_Lead_Hand_Linear_Vel` | 8.435351 |
| `PROCESSED.Max_RPV_CGPos_VLab_Linear_Vel` | 1.514948 |
| `PROCESSED.Max_RTA_CGPos_VLab_Linear_Vel` | 1.044566 |
| `PROCESSED.Lead_Foot_Vel_mag_max` | 1.708023 |
| `PROCESSED.Bat_travelled_distance_max` | 2.221222 |

## Setup vs Contact Snapshot

| Setup key (verbatim) | Setup | Contact key (verbatim) | Contact |
|---|---:|---|---:|
| `PROCESSED.Head_Angle@Setup` | -22.85107 | `PROCESSED.Head_Angle@Contact` | 4.113279 |
| `PROCESSED.Trunk_Angle@Setup` | 111.4796 | `PROCESSED.Trunk_Angle@Contact` | 26.59548 |
| `PROCESSED.Pelvis_Angle@Setup` | 112.2455 | `PROCESSED.Pelvis_Angle@Contact` | 6.57841 |
| `PROCESSED.Lead_Shoulder_Angle@Setup` | 49.17139 | `PROCESSED.Lead_Shoulder_Angle@Contact` | 12.71061 |
| `PROCESSED.Trail_Shoulder_Angle@Setup` | 35.90817 | `PROCESSED.Trail_Shoulder_Angle@Contact` | 83.45342 |
| `N/A (setup key not in payload)` | - | `PROCESSED.Lead_Elbow_Angle@Contact` | -96.51415 |
| `N/A (setup key not in payload)` | - | `PROCESSED.Trail_Elbow_Angle@Contact` | -30.63261 |
| `N/A (setup key not in payload)` | - | `PROCESSED.Lead_Knee_Angle@Contact` | 1.218566 |
| `N/A (setup key not in payload)` | - | `PROCESSED.Lead_Knee_Ang_Vel@Contact` | -21.61557 |

## Lead Foot Down Snapshot

| Variable (verbatim key) | Value |
|---|---:|
| `PROCESSED.Head_Angle@Lead_Foot_Down` | -29.67342 |
| `PROCESSED.Trunk_Angle@Lead_Foot_Down` | 117.6038 |
| `PROCESSED.Pelvis_Angle@Lead_Foot_Down` | 82.68243 |
| `PROCESSED.Stride_Width@Lead_Foot_Down` | 0.8925965 |
| `PROCESSED.Lead_Shoulder_Angle@Lead_Foot_Down` | 29.21249 |
| `PROCESSED.Trail_Shoulder_Angle@Lead_Foot_Down` | 76.30701 |
| `PROCESSED.Lead_Elbow_Angle@Lead_Foot_Down` | -105.6063 |
| `PROCESSED.Trail_Elbow_Angle@Lead_Foot_Down` | -64.37292 |
| `PROCESSED.Left_Wrist_Angle@Lead_Foot_Down` | 8.011238 |
| `PROCESSED.Right_Wrist_Angle@Lead_Foot_Down` | -1.467489 |
| `PROCESSED.Lead_Knee_Angle@Lead_Foot_Down` | 12.1947 |
| `PROCESSED.Lead_Knee_Ang_Vel@Lead_Foot_Down` | 51.44676 |
| `PROCESSED.Lead_Foot_Segment_Angle@Lead_Foot_Down` | 70.08463 |
| `PROCESSED.Trail_Foot_Segment_Angle@Lead_Foot_Down` | -96.10567 |

## Separation Metrics

| Variable (verbatim key) | Value |
|---|---:|
| `PROCESSED.Pelvis_Shoulders_Separation@Setup` | 1.936274 |
| `PROCESSED.Pelvis_Shoulders_Separation@Lead_Foot_Down` | 32.17485 |
| `PROCESSED.Pelvis_Shoulders_Separation@Downswing` | 23.09007 |
| `PROCESSED.Pelvis_Shoulders_Separation@Max_Bat_Ang_Vel` | 12.86822 |
| `PROCESSED.Pelvis_Shoulders_Separation@Max_Lead_Hand_Ang_Vel` | 20.72585 |
| `PROCESSED.Pelvis_Shoulders_Separation@Contact` | 3.607252 |

## Elbow Extremes

| Variable (verbatim key) | Value |
|---|---:|
| `PROCESSED.Lead_Elbow_Angle@Max_Lead_Elbow_Ext_Angle` | 84.88172 |
| `PROCESSED.Lead_Elbow_Angle@Max_Lead_Elbow_Sup_Angle` | -38.5611 |
| `PROCESSED.Trail_Elbow_Angle@Max_Trail_Elbow_Ext_Angle` | 117.7018 |
| `PROCESSED.Trail_Elbow_Angle@Max_Trail_Elbow_Pron_Angle` | -72.44567 |
| `PROCESSED.Lead_Elbow_Ang_Vel@Max_Lead_Elbow_Ext_Ang_Vel` | 390.9056 |
| `PROCESSED.Lead_Elbow_Ang_Vel@Max_Lead_Elbow_Sup_Ang_Vel` | 170.1556 |
| `PROCESSED.Trail_Elbow_Ang_Vel@Max_Trail_Elbow_Ext_Ang_Vel` | 62.72194 |
| `PROCESSED.Trail_Elbow_Ang_Vel@Max_Trail_Elbow_Pron_Ang_Vel` | -506.8253 |

## Measurement Window

| Variable (verbatim key) | Value |
|---|---:|
| `PROCESSED.Uncropped Measurement Frames` | 3134 |
| `PROCESSED.Uncropped Measurement Length` | 10.447 |
| `PROCESSED.Cropped Measurement Start Frame` | 2138 |
| `PROCESSED.Cropped Measurement End Frame` | 2724 |

## Notes

- Variable labels are now verbatim payload keys for direct mapping.
- All values are preserved from your source JSON.
