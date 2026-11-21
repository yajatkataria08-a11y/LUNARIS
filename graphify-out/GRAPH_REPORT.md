# Graph Report - Luna Safe  (2026-11-22)

## Corpus Check
- 129 files · ~105,357 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .zip 2, (none) 1, .csv 1)

## Summary
- 1117 nodes · 2281 edges · 61 communities (35 shown, 26 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 133 edges (avg confidence: 0.91)
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
- load_sites
- PipelineRunner
- dependencies
- app/slm/retrieval.py
- OriginCategory
- TestCoreTaxonomy
- main.py
- ClassicalCVBaseline
- GeomechanicalPhysicsEngine
- EvidenceDependencyGraph
- MCDARankingEngine
- LunarGeoReference
- scripts
- about/page.tsx
- RadiometricCalibrator
- UNetSegmentationModel
- ThreadedHTTPServer
- generate_all_candidate_dossiers.py
- run_pipeline.py
- streamlit_app.py
- transfer_learner.py
- AttentionGate
- ManifestManager
- EnsembleRunner
- pipelines/page.tsx
- TestTransferLearner
- json
- Track1InversionEngine
- LunarShapExplainer
- LunaSafeHTTPRequestHandler
- LunarShapExplainer
- pds4_pradan_parser.py
- advanced_isro_features.py
- MOSDACAnalogLoader
- LunarStackingEnsemble
- auth.tsx
- numpy
- login/page.tsx
- package.json
- TestMOSDACAnalogLoader
- @types/three@^0.187.0

## God Nodes (most connected - your core abstractions)
1. `react` - 36 edges
2. `QualityState` - 26 edges
3. `EvidenceDependencyGraph` - 25 edges
4. `lucide-react` - 25 edges
5. `OriginCategory` - 24 edges
6. `ImplementationStatus` - 22 edges
7. `run_tranquillitatis_assessment()` - 22 edges
8. `GeomechanicalPhysicsEngine` - 21 edges
9. `main()` - 21 edges
10. `EvidenceNode` - 20 edges

## Surprising Connections (you probably didn't know these)
- `TestTransferLearner` --uses--> `DFSARFeatureExtractor`  [INFERRED]
  tests/test_mosdac_and_transfer.py → ml_pipeline/features/dfsar_features.py
- `TestScientificIntegrity` --uses--> `PipelineRunner`  [INFERRED]
  tests/test_scientific_integrity.py → ml_pipeline/pipeline_runner.py
- `TestQualityLedgerGovernance` --uses--> `OriginCategory`  [INFERRED]
  tests/test_geospatial_and_quality.py → ml_pipeline/core/taxonomy.py
- `TestQualityLedgerGovernance` --uses--> `QualityState`  [INFERRED]
  tests/test_geospatial_and_quality.py → ml_pipeline/core/taxonomy.py
- `TestCoreTaxonomy` --uses--> `EvidenceDirection`  [INFERRED]
  tests/test_unet_pytorch.py → ml_pipeline/core/taxonomy.py

## Import Cycles
- None detected.

## Communities (61 total, 26 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.12
Nodes (15): devDependencies, eslint@^9, postcss@^8, tailwindcss@^3.4.1, @types/node@^20, @types/react@^19, @types/react-dom@^19, typescript@^5 (+7 more)

### Community 1 - "react"
Cohesion: 0.14
Nodes (22): nextConfig, lucide-react, next, react, CitationsPage(), ContactPage(), HomePage(), QUESTIONS (+14 more)

### Community 2 - "craters/page.tsx"
Cohesion: 0.13
Nodes (30): LunarCraterAtlasPage(), ViewMode, AnalogTwinInfo, CraterDetailCard(), CraterDetailCardProps, getAnalogTwin(), ShapWaterfallChart(), WaterfallStep (+22 more)

### Community 3 - "layout.tsx"
Cohesion: 0.09
Nodes (28): cinzel, geistMono, metadata, RootLayout(), spaceGrotesk, OAuthCallback(), SettingsPage(), CloudLobe (+20 more)

### Community 4 - "ohrc"
Cohesion: 0.07
Nodes (29): dataset, name, study_regions, version, bands, pixel_scale_m, polarizations, products (+21 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 6 - "validators.py"
Cohesion: 0.13
Nodes (5): CandidateDossierSchema, EvidenceItemSchema, validate_candidate_dossier(), validate_evidence_item(), TestPydanticValidators

### Community 7 - "api-client.ts"
Cohesion: 0.10
Nodes (25): GlobalImportanceResponse, ShapApiResponse, ShapDriver, ApiStatusBanner(), apiBase(), ApiError, AuthResponse, HealthResponse (+17 more)

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
Cohesion: 0.24
Nodes (4): DEMFeatureExtractor, DFSARFeatureExtractor, MultimodalFeatureExtractor, OHRCFeatureExtractor

### Community 14 - "scoring.ts"
Cohesion: 0.31
Nodes (13): FourQuestions(), TONE, accessValue(), answerQuestions(), clamp01(), classify(), computeDrivers(), rankSites() (+5 more)

### Community 15 - "load_sites"
Cohesion: 0.17
Nodes (13): api_get_site(), api_get_sites(), api_global_importance(), api_isro_lhi_all(), api_isro_lhi_site(), api_remediated_all(), api_remediated_site(), api_site_shap() (+5 more)

### Community 18 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, d3@^7.9.2, lucide-react@^1.72.0, next@15.1.7, @radix-ui/react-slot@^1.5.0, react@^19.0.0, react-dom@^19.0.0, tailwind-merge@^3.7.0 (+8 more)

### Community 22 - "main.py"
Cohesion: 0.16
Nodes (9): api_ensemble_predict(), api_slm_explain_site(), api_slm_query(), api_submit_verdict(), api_transfer_train(), AuthRequest, EnsemblePredictRequest, SlmQueryRequest (+1 more)

### Community 24 - "GeomechanicalPhysicsEngine"
Cohesion: 0.13
Nodes (4): GeomechanicalPhysicsEngine, NumericalContinuumSolver, StructuralSurrogateModel, TestGeomechanicalPhysicsEngine

### Community 25 - "EvidenceDependencyGraph"
Cohesion: 0.11
Nodes (9): ImplementationStatus, DependencyType, EvidenceDependencyGraph, EvidenceNode, EvidenceInferenceEngine, run_tranquillitatis_assessment(), TestEvidenceDependencyGraph, TestEvidenceInferenceEngine (+1 more)

### Community 26 - "MCDARankingEngine"
Cohesion: 0.13
Nodes (3): DecisionProfile, MCDARankingEngine, TestMCDARankingEngine

### Community 27 - "LunarGeoReference"
Cohesion: 0.13
Nodes (3): LunarGeoReference, TestCoregistrationEngine, TestLunarGeoreferencing

### Community 28 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 29 - "about/page.tsx"
Cohesion: 0.27
Nodes (8): AboutPage(), COMPARE, FORMATION, HAZARDS, metadata, Section(), TASKS, Disclaimer()

### Community 32 - "UNetSegmentationModel"
Cohesion: 0.05
Nodes (10): CombinedLoss, DiceLoss, DoubleConv, Down, LunarUNet, PredictionResult, UNetSegmentationModel, Up (+2 more)

### Community 35 - "run_pipeline.py"
Cohesion: 0.14
Nodes (4): ModelEvaluator, ProductLoader, compute_manifest_hash(), main()

### Community 38 - "AttentionGate"
Cohesion: 0.11
Nodes (5): AttentionGate, AttentionUNet, CompoundFocalDiceLoss, predict_with_tta(), ResidualDoubleConv

### Community 40 - "EnsembleRunner"
Cohesion: 0.09
Nodes (4): EnsembleRunner, feature_dict_to_array(), get_runner(), TabularBaselines

### Community 41 - "pipelines/page.tsx"
Cohesion: 0.10
Nodes (27): Card(), H(), PipelinesPage(), TaskId, TASKS, FILTERS, RankingPage(), SortKey (+19 more)

### Community 42 - "TestTransferLearner"
Cohesion: 0.05
Nodes (9): AttentionGate, AttentionUNet, CompoundFocalDiceLoss, predict_with_tta(), ResidualDoubleConv, GeomechanicalPhysicsRegularizer, HardNegativeShadowDiscriminator, MultistageTransferLearner (+1 more)

### Community 43 - "json"
Cohesion: 0.24
Nodes (4): api_get_dossier(), api_health(), load_data(), main()

### Community 44 - "Track1InversionEngine"
Cohesion: 0.15
Nodes (4): api_track1_all(), api_track1_site(), Track1InversionEngine, main()

### Community 46 - "LunaSafeHTTPRequestHandler"
Cohesion: 0.29
Nodes (3): extract_site_features(), LunaSafeHTTPRequestHandler, save_sites()

### Community 53 - "auth.tsx"
Cohesion: 0.36
Nodes (8): AuthUser, setAuthToken(), AuthCtx, AuthProvider(), Ctx, read(), Stored, write()

### Community 55 - "numpy"
Cohesion: 0.14
Nodes (6): EvidenceDirection, LifecycleState, OriginCategory, QualityState, CoregistrationEngine, QualityAssessment

### Community 56 - "login/page.tsx"
Cohesion: 0.26
Nodes (10): AuthCard(), Field(), LoginPage(), messageOf(), Mode, ICONS, LABEL, OAuthButtons() (+2 more)

### Community 60 - "package.json"
Cohesion: 0.20
Nodes (9): class-variance-authority@^0.7.1, clsx@^2.1.1, eslint-config-next@15.1.7, name, private, version, class-variance-authority, clsx (+1 more)

## Knowledge Gaps
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `main()` connect `run_pipeline.py` to `UNetSegmentationModel`, `os`, `streamlit_app.py`, `ManifestManager`, `json`, `typing`, `GeomechanicalPhysicsEngine`, `MCDARankingEngine`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `QualityState` (e.g. with `EvidenceDependencyGraph` and `EvidenceNode`) actually correct?**
  _`QualityState` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Why does `UNetSegmentationModel` connect `UNetSegmentationModel` to `EvidenceDependencyGraph`, `os`, `run_pipeline.py`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.13968253968253969 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `craters/page.tsx`, `layout.tsx`, `api-client.ts`, `pipelines/page.tsx`, `scoring.ts`, `dependencies`, `auth.tsx`, `login/page.tsx`, `package.json`, `about/page.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `craters/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._