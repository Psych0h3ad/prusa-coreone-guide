// SPDX-License-Identifier: MIT
// Numeric reference measurements and independent teaching paths; not OEM metrology.
export const PUCK_MOUNT={
  "puckMatrixMM": [
    [
      5.39331035528734e-08,
      1.1169819720956267e-08,
      0.9999999999999984,
      126.00127500515106
    ],
    [
      7.254713476347285e-08,
      -0.9999999999999973,
      1.1169815808264121e-08,
      2.300529064360457
    ],
    [
      0.9999999999999959,
      7.254713416104991e-08,
      -5.393310436321167e-08,
      123.6095012304846
    ],
    [
      0.0,
      0.0,
      0.0,
      1.0
    ]
  ],
  "holderMatrixMM": [
    [
      5.393310766069881e-08,
      -1.1169819843419872e-08,
      -0.9999999999999984,
      190.00127500515092
    ],
    [
      7.254711483389626e-08,
      0.9999999999999973,
      -1.1169815930728493e-08,
      2.300529779231004
    ],
    [
      0.9999999999999959,
      -7.254711423147326e-08,
      5.3933108582059176e-08,
      123.60949777876586
    ],
    [
      0.0,
      0.0,
      0.0,
      1.0
    ]
  ],
  "normal": [
    0.9999999999999984,
    1.1169815808264121e-08,
    -5.393310436321167e-08
  ],
  "pivot": [
    126.00127500515106,
    2.300529064360457,
    123.6095012304846
  ],
  "screws": [
    {
      "component": "puckMountScrew1",
      "sourceCADIndex": 151,
      "nominal": "M3x8rT",
      "sourceFaces": 9048,
      "headTopMM": [
        123.35127404621254,
        15.300528043096342,
        110.60949999063818
      ],
      "bearingMM": [
        125.00127404621253,
        15.300528061526538,
        110.60949990164856
      ],
      "axisHeadOut": [
        -0.9999999999999984,
        -1.1169815808264121e-08,
        5.393310436321167e-08
      ],
      "tipMM": [
        133.00127441725144,
        15.30052815088507,
        110.6094994701837
      ],
      "threadEngagementMM": 7.000000323541448,
      "nativeCADIndex": 155
    },
    {
      "component": "puckMountScrew2",
      "sourceCADIndex": 151,
      "nominal": "M3x8rT",
      "sourceFaces": 9048,
      "headTopMM": [
        123.35127573889095,
        15.300529908248672,
        136.6095011603678
      ],
      "bearingMM": [
        125.00127573889094,
        15.300529926678868,
        136.6095010713782
      ],
      "axisHeadOut": [
        -0.9999999999999984,
        -1.1169815808264121e-08,
        5.393310436321167e-08
      ],
      "tipMM": [
        133.00127610992985,
        15.3005300160374,
        136.60950063991334
      ],
      "threadEngagementMM": 7.000000323541448,
      "nativeCADIndex": 151
    },
    {
      "component": "puckMountScrew3",
      "sourceCADIndex": 151,
      "nominal": "M3x8rT",
      "sourceFaces": 9048,
      "headTopMM": [
        123.35127573888862,
        -10.699469973574816,
        136.6095027561773
      ],
      "bearingMM": [
        125.00127573888861,
        -10.69946995514462,
        136.60950266718768
      ],
      "axisHeadOut": [
        -0.9999999999999984,
        -1.1169815808264121e-08,
        5.393310436321167e-08
      ],
      "tipMM": [
        133.00127610992752,
        -10.699469865786089,
        136.60950223572283
      ],
      "threadEngagementMM": 7.000000323541448,
      "nativeCADIndex": 153
    },
    {
      "component": "puckMountScrew4",
      "sourceCADIndex": 151,
      "nominal": "M3x8rT",
      "sourceFaces": 9048,
      "headTopMM": [
        123.35127404621021,
        -10.69947183872842,
        110.60950158644606
      ],
      "bearingMM": [
        125.0012740462102,
        -10.699471820298223,
        110.60950149745644
      ],
      "axisHeadOut": [
        -0.9999999999999984,
        -1.1169815808264121e-08,
        5.393310436321167e-08
      ],
      "tipMM": [
        133.0012744172491,
        -10.699471730939692,
        110.60950106599158
      ],
      "threadEngagementMM": 7.000000323541448,
      "nativeCADIndex": 157
    }
  ],
  "box": {
    "sizeMM": [
      80,
      200,
      200
    ],
    "centerMM": [
      198.00127500515094,
      2.300529868587195,
      123.60949734730109
    ],
    "qualification": "Independent cardboard support illustration. Dimensions are authored estimates, not an official box size."
  },
  "turnLiftMM": 220,
  "turnEndOffsetMM": [
    27.999999952502492,
    3.1275484210085746e-07,
    -1.5101269196082409e-06
  ],
  "labels": {
    "place": [
      "Puckの取付穴を上に向け、箱の中央へ置く",
      "Place the Puck in the centre of the box with its screw holes facing up",
      "Položte Puck doprostřed krabice s otvory pro šrouby nahoru",
      "Puck mittig auf den Karton legen, Schraubenlöcher nach oben"
    ],
    "panel": [
      "右パネルの4穴をPuckに合わせ、ゆっくり下ろす",
      "Align the four right-panel holes with the Puck and lower the panel slowly",
      "Zarovnejte čtyři otvory pravého panelu s Puckem a panel pomalu spusťte",
      "Vier Löcher der rechten Seitenwand am Puck ausrichten und die Seitenwand langsam absenken"
    ],
    "turn": [
      "持ち替え例：パネルを持ち上げて裏返し、ホルダーの差込口を上へ向ける",
      "Handling example: lift and turn the panel over so the holder opening faces up",
      "Příklad manipulace: zvedněte a otočte panel tak, aby otvor držáku směřoval nahoru",
      "Handhabungsbeispiel: Seitenwand anheben und umdrehen, sodass die Halteröffnung nach oben zeigt"
    ],
    "screw0": [
      "M3x8rT 1/4：取付穴へ差し込み、締める",
      "M3x8rT 1/4: insert into the mounting hole and tighten",
      "M3x8rT 1/4: vložte do montážního otvoru a utáhněte",
      "M3x8rT 1/4: in das Befestigungsloch einsetzen und festziehen"
    ],
    "screw1": [
      "M3x8rT 2/4：取付穴へ差し込み、締める",
      "M3x8rT 2/4: insert into the mounting hole and tighten",
      "M3x8rT 2/4: vložte do montážního otvoru a utáhněte",
      "M3x8rT 2/4: in das Befestigungsloch einsetzen und festziehen"
    ],
    "screw2": [
      "M3x8rT 3/4：取付穴へ差し込み、締める",
      "M3x8rT 3/4: insert into the mounting hole and tighten",
      "M3x8rT 3/4: vložte do montážního otvoru a utáhněte",
      "M3x8rT 3/4: in das Befestigungsloch einsetzen und festziehen"
    ],
    "screw3": [
      "M3x8rT 4/4：取付穴へ差し込み、締める",
      "M3x8rT 4/4: insert into the mounting hole and tighten",
      "M3x8rT 4/4: vložte do montážního otvoru a utáhněte",
      "M3x8rT 4/4: in das Befestigungsloch einsetzen und festziehen"
    ]
  },
  "sources": {
    "build": {
      "guideID": 982292,
      "stepID": 997250,
      "place": [
        997264
      ],
      "panel": [
        997272,
        997280
      ],
      "screws": [
        1014283,
        1014284
      ]
    },
    "upgrade": {
      "guideID": 1014628,
      "stepID": 1022736,
      "place": [
        1022737
      ],
      "panel": [
        1022738,
        1022739
      ],
      "screws": [
        1022740
      ]
    }
  }
};
