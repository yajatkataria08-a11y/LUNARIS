# Graph Report - Luna Safe  (2026-11-25)

## Corpus Check
- 131 files · ~120,750 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 1, .csv 1, .xml 1)

## Summary
- 1128 nodes · 2309 edges · 65 communities (37 shown, 28 thin omitted)
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
- streamlit_app.py
- PipelineRunner
- dependencies
- app/slm/retrieval.py
- OriginCategory
- track1_pipeline.py
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
- run_pipeline.py
- ResearchRetriever
- LunarShapExplainer
- AttentionGate
- ManifestManager
- EnsembleRunner
- pipelines/page.tsx
- AttentionUNet
- generate_all_candidate_dossiers.py
- MultistageTransferLearner
- LunarShapExplainer
- tailwindcss
- LunarStackingEnsemble
- pds4_pradan_parser.py
- AdvancedISROFeatureExtractor
- test_mosdac_and_transfer.py
- MOSDACAnalogLoader
- auth.tsx
- taxonomy.py
- LunaSafeHTTPRequestHandler
- login/page.tsx
- json
- utils.ts
- ScientificReportAssistant
- HardNegativeShadowDiscriminator
- TestMOSDACAnalogLoader

## God Nodes (most connected - your core abstractions)
1. `react` - 36 edges
2. `lucide-react` - 26 edges
3. `OriginCategory` - 24 edges
4. `QualityState` - 24 edges
5. `EvidenceDependencyGraph` - 24 edges
6. `run_tranquillitatis_assessment()` - 22 edges
7. `ImplementationStatus` - 21 edges
8. `GeomechanicalPhysicsEngine` - 21 edges
9. `main()` - 21 edges
10. `EvidenceNode` - 20 edges

## Surprising Connections (you probably didn't know these)
- `TestTransferLearner` --uses--> `DFSARFeatureExtractor`  [INFERRED]
  tests/test_mosdac_and_transfer.py → ml_pipeline/features/dfsar_features.py
- `TestScientificIntegrity` --uses--> `PipelineRunner`  [INFERRED]
  tests/test_scientific_integrity.py → ml_pipeline/pipeline_runner.py
- `run_tranquillitatis_assessment()` --uses--> `OriginCategory`  [INFERRED]
  scripts/generate_tranquillitatis_dossier.py → ml_pipeline/core/taxonomy.py
- `TestEvidenceDependencyGraph` --uses--> `OriginCategory`  [INFERRED]
  tests/test_evidence_graph_and_inference.py → ml_pipeline/core/taxonomy.py
- `TestEvidenceInferenceEngine` --uses--> `OriginCategory`  [INFERRED]
  tests/test_evidence_graph_and_inference.py → ml_pipeline/core/taxonomy.py

## Import Cycles
- None detected.

## Communities (65 total, 28 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.15
Nodes (18): devDependencies, eslint@^9, eslint-config-next@^15.5.29, postcss@^8, @types/node@^20, @types/react@^19, @types/react-dom@^19, typescript@^5 (+10 more)

### Community 1 - "react"
Cohesion: 0.14
Nodes (22): nextConfig, lucide-react, next, react, CitationsPage(), ContactPage(), HomePage(), QUESTIONS (+14 more)

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
Cohesion: 0.17
Nodes (13): ApiStatusBanner(), apiBase(), ApiError, AuthResponse, HealthResponse, OAuthProvider, ReqOpts, request() (+5 more)

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
Cohesion: 0.42
Nodes (11): accessValue(), answerQuestions(), clamp01(), classify(), computeDrivers(), rankSites(), safeDetection(), safeRoof() (+3 more)

### Community 18 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, class-variance-authority@^0.7.1, d3@^7.9.2, lucide-react@^1.72.0, next@^15.5.29, @radix-ui/react-slot@^1.5.0, react@^19.0.0, react-dom@^19.0.0 (+10 more)

### Community 20 - "OriginCategory"
Cohesion: 0.16
Nodes (4): OriginCategory, QualityAssessment, QualityLedger, TestQualityLedgerGovernance

### Community 22 - "main.py"
Cohesion: 0.09
Nodes (27): api_auth_login(), api_auth_me(), api_auth_providers(), api_auth_signup(), api_ensemble_predict(), api_get_site(), api_get_sites(), api_global_importance() (+19 more)

### Community 25 - "EvidenceDependencyGraph"
Cohesion: 0.14
Nodes (7): EvidenceDependencyGraph, EvidenceNode, EvidenceInferenceEngine, run_tranquillitatis_assessment(), TestEvidenceDependencyGraph, TestEvidenceInferenceEngine, TestScientificIntegrity

### Community 26 - "MCDARankingEngine"
Cohesion: 0.13
Nodes (3): DecisionProfile, MCDARankingEngine, TestMCDARankingEngine

### Community 27 - "LunarGeoReference"
Cohesion: 0.08
Nodes (5): CoregistrationEngine, LunarGeoReference, RadiometricCalibrator, TestCoregistrationEngine, TestLunarGeoreferencing

### Community 28 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 29 - "about/page.tsx"
Cohesion: 0.27
Nodes (8): AboutPage(), COMPARE, FORMATION, HAZARDS, metadata, Section(), TASKS, Disclaimer()

### Community 31 - "streamlit_app.py"
Cohesion: 0.13
Nodes (4): GeomechanicalPhysicsEngine, NumericalContinuumSolver, StructuralSurrogateModel, TestGeomechanicalPhysicsEngine

### Community 32 - "UNetSegmentationModel"
Cohesion: 0.10
Nodes (7): CombinedLoss, DiceLoss, DoubleConv, Down, LunarUNet, Up, TestPyTorchUNet

### Community 33 - "UNetSegmentationModel"
Cohesion: 0.11
Nodes (3): PredictionResult, UNetSegmentationModel, TestZeroFabricationAndWrapper

### Community 35 - "run_pipeline.py"
Cohesion: 0.15
Nodes (4): ModelEvaluator, ProductLoader, compute_manifest_hash(), main()

### Community 38 - "AttentionGate"
Cohesion: 0.11
Nodes (5): AttentionGate, AttentionUNet, CompoundFocalDiceLoss, predict_with_tta(), ResidualDoubleConv

### Community 40 - "EnsembleRunner"
Cohesion: 0.15
Nodes (3): EnsembleRunner, feature_dict_to_array(), get_runner()

### Community 41 - "pipelines/page.tsx"
Cohesion: 0.08
Nodes (42): Card(), H(), PipelinesPage(), TaskId, TASKS, FILTERS, RankingPage(), SortKey (+34 more)

### Community 42 - "AttentionUNet"
Cohesion: 0.13
Nodes (4): AttentionGate, AttentionUNet, predict_with_tta(), ResidualDoubleConv

### Community 43 - "generate_all_candidate_dossiers.py"
Cohesion: 0.17
Nodes (5): api_site_shap(), extract_site_features(), ISROChandrayaanScoringEngine, generate_all_dossiers(), main()

### Community 45 - "LunarShapExplainer"
Cohesion: 0.07
Nodes (3): LunarStackingEnsemble, LunarShapExplainer, TabularBaselines

### Community 50 - "test_mosdac_and_transfer.py"
Cohesion: 0.19
Nodes (3): compute_mmd(), GeomechanicalPhysicsRegularizer, TestTransferLearner

### Community 53 - "auth.tsx"
Cohesion: 0.30
Nodes (11): AuthUser, setAuthToken(), AuthCtx, AuthProvider(), Ctx, hashString(), readSession(), readVault() (+3 more)

### Community 55 - "taxonomy.py"
Cohesion: 0.12
Nodes (5): EvidenceDirection, EvidenceRecord, LifecycleState, QualityState, TestCoreTaxonomy

### Community 57 - "login/page.tsx"
Cohesion: 0.38
Nodes (8): OAuthCallback(), AuthCard(), Field(), LoginPage(), messageOf(), Mode, OAuthButtons(), useAuth()

### Community 59 - "json"
Cohesion: 0.28
Nodes (4): api_get_dossier(), api_health(), api_track1_all(), main()

### Community 60 - "utils.ts"
Cohesion: 0.22
Nodes (4): clsx@^2.1.1, tailwind-merge@^3.7.0, clsx, tailwind-merge

## Knowledge Gaps
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_tranquillitatis_assessment()` connect `EvidenceDependencyGraph` to `typing`, `run_pipeline.py`, `validators.py`, `LunarGeoReference`, `OriginCategory`, `taxonomy.py`, `generate_tranquillitatis_dossier.py`, `json`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `run_pipeline.py` to `UNetSegmentationModel`, `typing`, `ResearchRetriever`, `ManifestManager`, `MCDARankingEngine`, `json`, `streamlit_app.py`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.1411764705882353 - nodes in this community are weakly interconnected._
- **Why does `LunarGeoReference` connect `LunarGeoReference` to `generate_tranquillitatis_dossier.py`, `EvidenceDependencyGraph`, `OriginCategory`, `taxonomy.py`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Should `craters/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13174603174603175 - nodes in this community are weakly interconnected._
- **Should `layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0928030303030303 - nodes in this community are weakly interconnected._