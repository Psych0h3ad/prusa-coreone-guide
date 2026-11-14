# PG assembly reference geometry

This model illustrates the Nextruder planetary assembly in millimetres. It is an assembly reference, not an OEM manufacturing drawing or a strength, tolerance or fit specification.

The native motor/pinion is unchanged. Its measured 14-period profile is the geometric input to the constructed 56-tooth planets and 126-tooth ring. The planetary relationship follows Prusa's published Nextruder 1:10 reference; these derived counts are not represented as a separately verified OEM tooth drawing.

The source carrier's 1.4 mm gauge, bearing and pin locations are retained. Its outline is rebuilt as a 12.5 mm radius analytic reference within the measured 12.6 mm fixed main-plate pocket. The blind pin seats match the unchanged 2.9 mm source pins and their existing end positions. The ring retains its outside envelope, mounting holes, 4.8 mm body thickness and 4.5 mm active tooth width. Its guide passage and one-sided lead-in follow the source adapter and the official assembly orientation.

The 0.025 mm normal backlash, 0.10 mm free-fit allowances and 0.30 mm lead-in are constructed reference values. They are not manufacturer tolerances.

Sources and scoped terms:

- Prusa Research, [CORE One source assembly](https://www.printables.com/model/1520471): native motor/pinion and native-derived profile data, [Open Community License v1](../../../licenses/OCL-1.0.txt).
- Prusa Research, [CORE One printable parts](https://www.printables.com/model/1167816): unchanged main plate and PG assembly adapter used as dimensional references. Their original [GPL v2 terms](../../../licenses/GPL-2.0.txt) remain with those source models. Their mesh surfaces are not embedded in the analytic carrier.
- Prusa Research, [Nextruder planetary reference](https://blog.prusa3d.com/development-update-reworked-nextruder-new-features-and-updated-shipping-information_69967/).
- Prusa Research, [PG ring orientation](https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941308) and [assembly/free-rotation instructions](https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941368).
- Original new runtime/generator code and analytic carrier construction: [MIT](MIT.txt). Native-derived profile data retain OCL v1. These statements do not relicense the application or other source assets.

The editable [recipe](recipe.json), [profile generator](build-profile.py) and [runtime construction](../../../pg-gear-reference.js) accompany this reference. The original manufacturer and community assets retain their own notices.
