# Zap-artifacts

This repository provides official mainnet Zap Artifacts

### Prerequisites
```
- Nodejs and npm>=6.1.11
- Typescript
```

## Usage
##### Get Artifacts
```
npm install --save `@zap/artifacts`
```

Example : get Bondage Artifact
```
import {ZapArtifacts} from '@zap/artifacts';
const BondageArtifact = ZapArtifacts['Bondage']
```

Available Artifacts:
* Registry
* RegistryStorage
* Bondage
* BondageStorage
* Dispatch
* DispatchStorage
* CurrentCost
* ZapToken