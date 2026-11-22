# Graph Report - Luna Safe  (2026-11-22)

## Corpus Check
- 130 files · ~108,636 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 1, .csv 1, .xml 1)

## Summary
- 1126 nodes · 2306 edges · 60 communities (33 shown, 27 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- package.json
- react
- craters/page.tsx
- layout.tsx
- ohrc
- compilerOptions
- validators.py
- api-client.ts
- eslint.config.mjs
- SoundFXEngine
- postcss.config.mjs
- segmentation
- weights
- extractor.py
- scoring.ts
- numpy
- PipelineRunner
- dependencies
- app/slm/retrieval.py
- OriginCategory
- preprocessing/__init__.py
- main.py
- ClassicalCVBaseline
- generate_tranquillitatis_dossier.py
- EvidenceDependencyGraph
- MCDARankingEngine
- LunarGeoReference
- scripts
- about/page.tsx
- streamlit_app.py
- UNetSegmentationModel
- UNetSegmentationModel
- json
- run_pipeline.py
- ResearchRetriever
- LunarShapExplainer
- AttentionGate
- ManifestManager
- EnsembleRunner
- pipelines/page.tsx
- MultistageTransferLearner
- LunarStackingEnsemble
- LunarMap.tsx
- LunarShapExplainer
- tailwindcss
- LunarStackingEnsemble
- pds4_pradan_parser.py
- AdvancedISROFeatureExtractor
- MOSDACAnalogLoader
- auth.tsx
- TestCoreTaxonomy
- TabularBaselines
- transfer_learner.py
- utils.ts
- TestMOSDACAnalogLoader

## God Nodes (most connected - your core abstractions)
1. `react` - 36 edges
2. `lucide-react` - 26 edges
3. `OriginCategory` - 24 edges
4. `QualityState` - 24 edges
5. `EvidenceDependencyGraph` - 24 edges
6. `run_tranquillitatis_assessment()` - 22 edges
7. `GeomechanicalPhysicsEngine` - 21 edges
8. `ImplementationStatus` - 21 edges
9. `main()` - 21 edges
10. `EvidenceNode` - 20 edges

## Surprising Connections (you probably didn't know these)
- `run_tranquillitatis_assessment()` --uses--> `CoregistrationEngine`  [INFERRED]
  scripts/generate_tranquillitatis_dossier.py → ml_pipeline/preprocessing/coregistration.py
- `TestTransferLearner` --uses--> `DFSARFeatureExtractor`  [INFERRED]
  tests/test_mosdac_and_transfer.py → ml_pipeline/features/dfsar_features.py
- `TestTransferLearner` --uses--> `ISROChandrayaanScoringEngine`  [INFERRED]
  tests/test_mosdac_and_transfer.py → ml_pipeline/ranking/isro_scoring.py
- `TestScientificIntegrity` --uses--> `PipelineRunner`  [INFERRED]
  tests/test_scientific_integrity.py → ml_pipeline/pipeline_runner.py
- `run_tranquillitatis_assessment()` --uses--> `OriginCategory`  [INFERRED]
  scripts/generate_tranquillitatis_dossier.py → ml_pipeline/core/taxonomy.py

## Import Cycles
- None detected.

## Communities (60 total, 27 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.15
Nodes (18): devDependencies, eslint@^9, eslint-config-next@^15.5.29, postcss@^8, @types/node@^20, @types/react@^19, @types/react-dom@^19, typescript@^5 (+10 more)

### Community 1 - "react"
Cohesion: 0.14
Nodes (23): nextConfig, lucide-react, next, react, CitationsPage(), ContactPage(), OAuthCallback(), AuthCard() (+15 more)

### Community 2 - "craters/page.tsx"
Cohesion: 0.13
Nodes (29): LunarCraterAtlasPage(), ViewMode, AnalogTwinInfo, CraterDetailCard(), CraterDetailCardProps, getAnalogTwin(), ShapWaterfallChart(), WaterfallStep (+21 more)

### Community 3 - "layout.tsx"
Cohesion: 0.09
Nodes (27): cinzel, geistMono, metadata, RootLayout(), spaceGrotesk, CloudLobe, CoronalProminence, CosmicRipple (+19 more)

### Community 4 - "ohrc"
Cohesion: 0.07
Nodes (29): dataset, name, study_regions, version, bands, pixel_scale_m, polarizations, products (+21 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 6 - "validators.py"
Cohesion: 0.14
Nodes (5): CandidateDossierSchema, EvidenceItemSchema, validate_candidate_dossier(), validate_evidence_item(), TestPydanticValidators

### Community 7 - "api-client.ts"
Cohesion: 0.09
Nodes (30): TiersData, IsroLhiData, ShapDriver, ShapExplanation, GlobalImportanceResponse, ShapApiResponse, ShapDriver, ApiStatusBanner() (+22 more)

### Community 8 - "eslint.config.mjs"
Cohesion: 0.22
Nodes (6): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc@^3, @eslint/eslintrc

### Community 11 - "segmentation"
Cohesion: 0.07
Nodes (26): segmentation, batch_size, bce_weight, dice_weight, encoder_channels, epochs, in_channels, learning_rate (+18 more)

### Community 12 - "weights"
Cohesion: 0.08
Nodes (23): fusion, calibration, modality_weights, strategy, uncertainty_propagation, dfsar_radar_anomaly, geological_context, ohrc_segmentation (+15 more)

### Community 13 - "extractor.py"
Cohesion: 0.12
Nodes (4): DEMFeatureExtractor, DFSARFeatureExtractor, MultimodalFeatureExtractor, OHRCFeatureExtractor

### Community 14 - "scoring.ts"
Cohesion: 0.37
Nodes (12): accessValue(), answerQuestions(), clamp01(), classify(), computeDrivers(), rankSites(), safeDetection(), safeRoof() (+4 more)

### Community 18 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, class-variance-authority@^0.7.1, d3@^7.9.2, lucide-react@^1.72.0, next@^15.5.29, @radix-ui/react-slot@^1.5.0, react@^19.0.0, react-dom@^19.0.0 (+10 more)

### Community 20 - "OriginCategory"
Cohesion: 0.14
Nodes (4): OriginCategory, QualityAssessment, QualityLedger, TestQualityLedgerGovernance

### Community 22 - "main.py"
Cohesion: 0.05
Nodes (36): api_auth_login(), api_auth_me(), api_auth_providers(), api_auth_signup(), api_ensemble_predict(), api_get_dossier(), api_get_site(), api_get_sites() (+28 more)

### Community 24 - "generate_tranquillitatis_dossier.py"
Cohesion: 0.15
Nodes (5): EvidenceDirection, ImplementationStatus, LifecycleState, QualityState, DependencyType

### Community 25 - "EvidenceDependencyGraph"
Cohesion: 0.14
Nodes (7): EvidenceDependencyGraph, EvidenceNode, EvidenceInferenceEngine, run_tranquillitatis_assessment(), TestEvidenceDependencyGraph, TestEvidenceInferenceEngine, TestScientificIntegrity

### Community 26 - "MCDARankingEngine"
Cohesion: 0.13
Nodes (3): DecisionProfile, MCDARankingEngine, TestMCDARankingEngine

### Community 27 - "LunarGeoReference"
Cohesion: 0.13
Nodes (4): CoregistrationEngine, LunarGeoReference, TestCoregistrationEngine, TestLunarGeoreferencing

### Community 28 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 29 - "about/page.tsx"
Cohesion: 0.28
Nodes (8): AboutPage(), COMPARE, FORMATION, HAZARDS, metadata, Section(), TASKS, Disclaimer()

### Community 31 - "streamlit_app.py"
Cohesion: 0.13
Nodes (4): GeomechanicalPhysicsEngine, NumericalContinuumSolver, StructuralSurrogateModel, TestGeomechanicalPhysicsEngine

### Community 32 - "UNetSegmentationModel"
Cohesion: 0.06
Nodes (8): CombinedLoss, DiceLoss, DoubleConv, Down, LunarUNet, PredictionResult, Up, TestPyTorchUNet

### Community 34 - "json"
Cohesion: 0.11
Nodes (4): ISROChandrayaanScoringEngine, generate_all_dossiers(), main(), main()

### Community 35 - "run_pipeline.py"
Cohesion: 0.17
Nodes (3): ModelEvaluator, compute_manifest_hash(), main()

### Community 38 - "AttentionGate"
Cohesion: 0.11
Nodes (5): AttentionGate, AttentionUNet, CompoundFocalDiceLoss, predict_with_tta(), ResidualDoubleConv

### Community 40 - "EnsembleRunner"
Cohesion: 0.15
Nodes (3): EnsembleRunner, feature_dict_to_array(), get_runner()

### Community 41 - "pipelines/page.tsx"
Cohesion: 0.13
Nodes (24): Card(), H(), PipelinesPage(), TaskId, TASKS, FILTERS, RankingPage(), SortKey (+16 more)

### Community 42 - "MultistageTransferLearner"
Cohesion: 0.06
Nodes (9): AttentionGate, AttentionUNet, CompoundFocalDiceLoss, predict_with_tta(), ResidualDoubleConv, GeomechanicalPhysicsRegularizer, HardNegativeShadowDiscriminator, MultistageTransferLearner (+1 more)

### Community 44 - "LunarMap.tsx"
Cohesion: 0.32
Nodes (7): COLOR, LunarMap(), MapTextureMode, MARIA, PROMINENT_CRATERS, x(), y()

### Community 53 - "auth.tsx"
Cohesion: 0.30
Nodes (11): AuthUser, setAuthToken(), AuthCtx, AuthProvider(), Ctx, hashString(), readSession(), readVault() (+3 more)

### Community 60 - "utils.ts"
Cohesion: 0.22
Nodes (4): clsx@^2.1.1, tailwind-merge@^3.7.0, clsx, tailwind-merge

## Knowledge Gaps
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `main()` connect `run_pipeline.py` to `UNetSegmentationModel`, `UNetSegmentationModel`, `json`, `MCDARankingEngine`, `ResearchRetriever`, `ManifestManager`, `numpy`, `transfer_learner.py`, `streamlit_app.py`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._
- **Why does `run_tranquillitatis_assessment()` connect `EvidenceDependencyGraph` to `json`, `validators.py`, `numpy`, `OriginCategory`, `generate_tranquillitatis_dossier.py`, `LunarGeoReference`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.14366998577524892 - nodes in this community are weakly interconnected._
- **Why does `LunarShapExplainer` connect `LunarShapExplainer` to `models/ensemble_stacker.py`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `craters/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13174603174603175 - nodes in this community are weakly interconnected._
- **Should `layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0928030303030303 - nodes in this community are weakly interconnected._