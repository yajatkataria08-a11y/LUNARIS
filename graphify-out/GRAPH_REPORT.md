# Graph Report - Luna Safe  (2026-11-22)

## Corpus Check
- 130 files · ~108,349 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 1, .csv 1, .xml 1)

## Summary
- 1125 nodes · 2308 edges · 66 communities (36 shown, 30 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 136 edges (avg confidence: 0.91)
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
- main.py
- main.py
- ClassicalCVBaseline
- evidence_graph.py
- EvidenceDependencyGraph
- MCDARankingEngine
- LunarGeoReference
- scripts
- LunarMap.tsx
- streamlit_app.py
- UNetSegmentationModel
- UNetSegmentationModel
- typing
- run_pipeline.py
- ResearchRetriever
- LunarShapExplainer
- AttentionGate
- ManifestManager
- EnsembleRunner
- pipelines/page.tsx
- AttentionUNet
- LunarStackingEnsemble
- Track1InversionEngine
- LunarShapExplainer
- LunaSafeHTTPRequestHandler
- LunarStackingEnsemble
- pds4_pradan_parser.py
- advanced_isro_features.py
- MOSDACAnalogLoader
- auth.tsx
- test_unet_pytorch.py
- TabularBaselines
- MultistageTransferLearner
- test_mosdac_and_transfer.py
- package.json
- ScientificReportAssistant
- HardNegativeShadowDiscriminator
- @types/three@^0.187.0
- TestMOSDACAnalogLoader

## God Nodes (most connected - your core abstractions)
1. `react` - 36 edges
2. `QualityState` - 26 edges
3. `lucide-react` - 26 edges
4. `EvidenceDependencyGraph` - 25 edges
5. `OriginCategory` - 24 edges
6. `ImplementationStatus` - 22 edges
7. `run_tranquillitatis_assessment()` - 22 edges
8. `GeomechanicalPhysicsEngine` - 21 edges
9. `main()` - 21 edges
10. `EvidenceNode` - 20 edges

## Surprising Connections (you probably didn't know these)
- `TestTransferLearner` --uses--> `DFSARFeatureExtractor`  [INFERRED]
  tests/test_mosdac_and_transfer.py → ml_pipeline/features/dfsar_features.py
- `TestTransferLearner` --uses--> `ISROChandrayaanScoringEngine`  [INFERRED]
  tests/test_mosdac_and_transfer.py → ml_pipeline/ranking/isro_scoring.py
- `TestScientificIntegrity` --uses--> `PipelineRunner`  [INFERRED]
  tests/test_scientific_integrity.py → ml_pipeline/pipeline_runner.py
- `TestScientificIntegrity` --uses--> `ImplementationStatus`  [INFERRED]
  tests/test_scientific_integrity.py → ml_pipeline/core/taxonomy.py
- `TestScientificIntegrity` --uses--> `LifecycleState`  [INFERRED]
  tests/test_scientific_integrity.py → ml_pipeline/core/taxonomy.py

## Import Cycles
- None detected.

## Communities (66 total, 30 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.12
Nodes (15): devDependencies, eslint@^9, postcss@^8, tailwindcss@^3.4.1, @types/node@^20, @types/react@^19, @types/react-dom@^19, typescript@^5 (+7 more)

### Community 1 - "react"
Cohesion: 0.16
Nodes (21): nextConfig, lucide-react, next, react, CitationsPage(), ContactPage(), OAuthCallback(), AuthCard() (+13 more)

### Community 2 - "craters/page.tsx"
Cohesion: 0.13
Nodes (29): LunarCraterAtlasPage(), ViewMode, AnalogTwinInfo, CraterDetailCard(), CraterDetailCardProps, getAnalogTwin(), ShapWaterfallChart(), WaterfallStep (+21 more)

### Community 3 - "layout.tsx"
Cohesion: 0.10
Nodes (25): cinzel, geistMono, metadata, RootLayout(), spaceGrotesk, CloudLobe, CoronalProminence, CosmicRipple (+17 more)

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
Cohesion: 0.09
Nodes (28): TiersData, GlobalImportanceResponse, ShapApiResponse, ShapDriver, ApiStatusBanner(), api, apiBase(), ApiError (+20 more)

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
Cohesion: 0.17
Nodes (4): DEMFeatureExtractor, DFSARFeatureExtractor, MultimodalFeatureExtractor, OHRCFeatureExtractor

### Community 14 - "scoring.ts"
Cohesion: 0.25
Nodes (15): IsroLhiData, ShapDriver, ShapExplanation, accessValue(), answerQuestions(), clamp01(), classify(), computeDrivers() (+7 more)

### Community 15 - "load_sites"
Cohesion: 0.18
Nodes (6): api_remediated_all(), api_remediated_site(), extract_site_features(), ISROChandrayaanScoringEngine, generate_all_dossiers(), main()

### Community 18 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, d3@^7.9.2, lucide-react@^1.72.0, next@^15.5.29, @radix-ui/react-slot@^1.5.0, react@^19.0.0, react-dom@^19.0.0, tailwind-merge@^3.7.0 (+8 more)

### Community 20 - "OriginCategory"
Cohesion: 0.13
Nodes (6): OriginCategory, QualityState, CoregistrationEngine, QualityAssessment, QualityLedger, TestQualityLedgerGovernance

### Community 21 - "main.py"
Cohesion: 0.18
Nodes (14): api_auth_me(), api_auth_providers(), api_get_dossier(), api_get_site(), api_get_sites(), api_global_importance(), api_health(), api_isro_lhi_all() (+6 more)

### Community 22 - "main.py"
Cohesion: 0.10
Nodes (13): api_auth_login(), api_auth_signup(), api_ensemble_predict(), api_slm_explain_site(), api_slm_query(), api_submit_verdict(), api_transfer_train(), AuthRequest (+5 more)

### Community 25 - "EvidenceDependencyGraph"
Cohesion: 0.15
Nodes (6): EvidenceDependencyGraph, EvidenceNode, EvidenceInferenceEngine, run_tranquillitatis_assessment(), TestEvidenceDependencyGraph, TestEvidenceInferenceEngine

### Community 26 - "MCDARankingEngine"
Cohesion: 0.13
Nodes (3): DecisionProfile, MCDARankingEngine, TestMCDARankingEngine

### Community 27 - "LunarGeoReference"
Cohesion: 0.08
Nodes (4): LunarGeoReference, RadiometricCalibrator, TestCoregistrationEngine, TestLunarGeoreferencing

### Community 28 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 29 - "LunarMap.tsx"
Cohesion: 0.13
Nodes (18): AboutPage(), COMPARE, FORMATION, HAZARDS, metadata, Section(), TASKS, HomePage() (+10 more)

### Community 31 - "streamlit_app.py"
Cohesion: 0.11
Nodes (5): GeomechanicalPhysicsEngine, NumericalContinuumSolver, StructuralSurrogateModel, load_data(), TestGeomechanicalPhysicsEngine

### Community 32 - "UNetSegmentationModel"
Cohesion: 0.09
Nodes (7): CombinedLoss, DiceLoss, DoubleConv, Down, LunarUNet, Up, TestPyTorchUNet

### Community 33 - "UNetSegmentationModel"
Cohesion: 0.11
Nodes (4): PredictionResult, UNetSegmentationModel, TestScientificIntegrity, TestZeroFabricationAndWrapper

### Community 35 - "run_pipeline.py"
Cohesion: 0.11
Nodes (5): ModelEvaluator, ProductLoader, compute_manifest_hash(), main(), SLMReportAssistant

### Community 38 - "AttentionGate"
Cohesion: 0.11
Nodes (5): AttentionGate, AttentionUNet, CompoundFocalDiceLoss, predict_with_tta(), ResidualDoubleConv

### Community 40 - "EnsembleRunner"
Cohesion: 0.15
Nodes (3): EnsembleRunner, feature_dict_to_array(), get_runner()

### Community 41 - "pipelines/page.tsx"
Cohesion: 0.12
Nodes (23): Card(), H(), PipelinesPage(), TaskId, TASKS, FILTERS, RankingPage(), SortKey (+15 more)

### Community 42 - "AttentionUNet"
Cohesion: 0.11
Nodes (5): AttentionGate, AttentionUNet, CompoundFocalDiceLoss, predict_with_tta(), ResidualDoubleConv

### Community 44 - "Track1InversionEngine"
Cohesion: 0.13
Nodes (4): api_track1_all(), api_track1_site(), Track1InversionEngine, main()

### Community 53 - "auth.tsx"
Cohesion: 0.30
Nodes (11): AuthUser, setAuthToken(), AuthCtx, AuthProvider(), Ctx, hashString(), readSession(), readVault() (+3 more)

### Community 55 - "test_unet_pytorch.py"
Cohesion: 0.13
Nodes (5): EvidenceDirection, EvidenceRecord, ImplementationStatus, LifecycleState, TestCoreTaxonomy

### Community 58 - "test_mosdac_and_transfer.py"
Cohesion: 0.18
Nodes (3): compute_mmd(), GeomechanicalPhysicsRegularizer, TestTransferLearner

### Community 60 - "package.json"
Cohesion: 0.20
Nodes (9): class-variance-authority@^0.7.1, clsx@^2.1.1, eslint-config-next@^15.5.29, name, private, version, class-variance-authority, clsx (+1 more)

## Knowledge Gaps
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `main()` connect `run_pipeline.py` to `UNetSegmentationModel`, `typing`, `ManifestManager`, `extractor.py`, `MCDARankingEngine`, `streamlit_app.py`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `QualityState` (e.g. with `EvidenceDependencyGraph` and `EvidenceNode`) actually correct?**
  _`QualityState` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Why does `run_tranquillitatis_assessment()` connect `EvidenceDependencyGraph` to `typing`, `validators.py`, `extractor.py`, `OriginCategory`, `test_unet_pytorch.py`, `evidence_graph.py`, `LunarGeoReference`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Should `craters/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13174603174603175 - nodes in this community are weakly interconnected._
- **Why does `UNetSegmentationModel` connect `UNetSegmentationModel` to `evidence_graph.py`, `UNetSegmentationModel`, `run_pipeline.py`, `test_unet_pytorch.py`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09655172413793103 - nodes in this community are weakly interconnected._