// Preserve linear RGB values and the Color type consumed by applyMaterials.
export function cloneServiceMaterial(source){
 if(Array.isArray(source))return source.map(cloneServiceMaterial);
 const material=source.clone();
 if(source.userData.originalColor?.isColor)material.userData.originalColor=source.userData.originalColor.clone();
 return material;
}
