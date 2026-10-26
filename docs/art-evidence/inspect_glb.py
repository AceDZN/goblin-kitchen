"""Inspect a local, UI-acquired GLB without browser or network access."""
from pathlib import Path
import hashlib, json, struct, sys

source = Path(sys.argv[1])
blob = source.read_bytes()
magic, version, declared = struct.unpack_from('<III', blob)
if magic != 0x46546C67 or version != 2:
    raise ValueError('Expected glTF 2.0 GLB')
chunks, offset = {}, 12
while offset < len(blob):
    length, kind = struct.unpack_from('<II', blob, offset)
    chunks[kind] = blob[offset + 8:offset + 8 + length]
    offset += 8 + length
model = json.loads(chunks[0x4E4F534A])
binary = chunks.get(0x004E4942, b'')
accessors = model.get('accessors', [])
views = model.get('bufferViews', [])
nodes = model.get('nodes', [])
joint_ids = {i for skin in model.get('skins', []) for i in skin.get('joints', [])}

def accessor_varies(index):
    accessor = accessors[index]
    if 'bufferView' not in accessor or accessor['count'] < 2:
        return False
    components = {'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[accessor['type']]
    fmt, size = {5120:('b',1),5121:('B',1),5122:('h',2),5123:('H',2),5125:('I',4),5126:('f',4)}[accessor['componentType']]
    view = views[accessor['bufferView']]
    start = view.get('byteOffset',0) + accessor.get('byteOffset',0)
    stride = view.get('byteStride',components*size)
    first = struct.unpack_from('<'+fmt*components,binary,start)
    return any(any(abs(value-first[c])>1e-6 for c,value in enumerate(struct.unpack_from('<'+fmt*components,binary,start+i*stride))) for i in range(1,accessor['count']))

def accessor_scalar_bounds(index):
    accessor = accessors[index]
    if 'min' in accessor and 'max' in accessor:
        return accessor['min'][0], accessor['max'][0]
    view = views[accessor['bufferView']]
    fmt, size = {5120:('b',1),5121:('B',1),5122:('h',2),5123:('H',2),5125:('I',4),5126:('f',4)}[accessor['componentType']]
    start = view.get('byteOffset',0) + accessor.get('byteOffset',0)
    stride = view.get('byteStride',size)
    values = [struct.unpack_from('<'+fmt,binary,start+i*stride)[0] for i in range(accessor['count'])]
    return min(values), max(values)

meshes = []
for mesh in model.get('meshes', []):
    primitives = []
    for primitive in mesh.get('primitives', []):
        position = accessors[primitive['attributes']['POSITION']]
        primitives.append({'attributes':list(primitive['attributes']), 'vertexCount':position['count'], 'positionMin':position.get('min'), 'positionMax':position.get('max'), 'indices':accessors[primitive['indices']]['count'] if 'indices' in primitive else None})
    meshes.append({'name':mesh.get('name'),'primitives':primitives})
clips = []
for animation in model.get('animations', []):
    inputs = {s['input'] for s in animation['samplers']}
    bounds = [accessor_scalar_bounds(i) for i in inputs]
    targets = [{'node':c['target'].get('node'), 'nodeName':nodes[c['target']['node']].get('name'), 'path':c['target']['path'], 'isSkinJoint':c['target'].get('node') in joint_ids, 'outputVaries':accessor_varies(animation['samplers'][c['sampler']]['output'])} for c in animation['channels'] if 'node' in c['target']]
    clips.append({'name':animation.get('name'), 'startSeconds':min(x[0] for x in bounds),'endSeconds':max(x[1] for x in bounds),'durationSeconds':max(x[1] for x in bounds)-min(x[0] for x in bounds),'channels':len(animation['channels']),'targetNodes':len({x['node'] for x in targets}),'skinJointTargetNodes':len({x['node'] for x in targets if x['isSkinJoint']}),'varyingChannels':len([x for x in targets if x['outputVaries']]),'varyingSkinJointNodes':len({x['node'] for x in targets if x['isSkinJoint'] and x['outputVaries']}),'paths':sorted({x['path'] for x in targets}),'keyframeInputAccessors':len(inputs),'targets':targets})
report = {'path':str(source),'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest(),'generator':model.get('asset',{}).get('generator'),'glbVersion':version,'declaredLengthMatches':len(blob)==declared,'nodes':len(nodes),'nodeTransforms':[{'index':i,'name':n.get('name'),**{k:n[k] for k in ['translation','rotation','scale','matrix','skin','mesh'] if k in n}} for i,n in enumerate(nodes)],'skins':[{'name':s.get('name'),'jointCount':len(s.get('joints',[])),'jointNames':[nodes[i].get('name') for i in s.get('joints',[])]} for s in model.get('skins',[])],'animations':clips,'meshes':meshes,'materials':len(model.get('materials',[])),'images':model.get('images',[]),'extensionsUsed':model.get('extensionsUsed',[]),'extensionsRequired':model.get('extensionsRequired',[])}
print(json.dumps(report,indent=2))
