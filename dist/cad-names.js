// CAD exports sometimes replace a named part with a generic body/instance label.
// Keep the nearest descriptive ancestor for display; preserve source names separately.
export function cadDisplayName(raw,inherited=''){
 const name=raw.trim();
 if(!name||name.startsWith('=>'))return inherited;
 if(inherited&&/^(?:Component\d+|SOLID\d+(?:-\d+)?|Body\d+)(?::\d+)?$/i.test(name))return inherited;
 return name;
}
