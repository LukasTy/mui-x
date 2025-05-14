import * as rae from 'react-api-extractor';
import { formatProperties } from './formatter';

export function formatComponentData(component: rae.ExportNode, allExports: rae.ExportNode[]) {
  const description = component.documentation?.description?.replace(/\n\nDocumentation: .*$/ms, '');

  return {
    name: component.name,
    description,
    props: formatProperties((component.type as rae.ComponentNode).props),
  };
}

export function isPublicComponent(exportNode: rae.ExportNode) {
  return (
    exportNode.type instanceof rae.ComponentNode &&
    !exportNode.documentation?.hasTag('ignore') &&
    exportNode.isPublic()
  );
}
