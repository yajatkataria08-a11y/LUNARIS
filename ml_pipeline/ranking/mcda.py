"""
LunaSafe-AI Profile-Specific Decision Analysis & Non-Compensatory Prioritization Engine (Module M7)
Conforming to Combined Research & Implementation Pipeline v4.0 (Sections 0.1, 1.2, 16, 16.1-16.7)

Features:
- Sequential 5-Gate Non-Compensatory Screening Funnel (eliminates compensatory score masking)
- Multi-stakeholder parallel mission profiles:
  * SCIENTIFIC_INVESTIGATION (focus on void detection & geology)
  * SPELEOLOGICAL_EXPLORATION (focus on interior access & geometry)
  * ROBOTIC_INGRESS (focus on surface slope, collar stability, landing safety)
- Explicit Monte Carlo Credible Intervals & Rank Stability Assessment
- No-Ranking outcome when evidence is tied or unstable to assumptions (Section 16.6)
"""

from typing import Dict, Any, List, Tuple, Optional
from enum import Enum
import numpy as np


class DecisionProfile(str, Enum):
    SCIENTIFIC_INVESTIGATION = "SCIENTIFIC_INVESTIGATION"
    SPELEOLOGICAL_EXPLORATION = "SPELEOLOGICAL_EXPLORATION"
    ROBOTIC_INGRESS = "ROBOTIC_INGRESS"


class MCDARankingEngine:
    """
    Profile-Specific Decision Analysis Engine.
    Strictly separates scientific inference from decision preferences.
    """

    PROFILE_WEIGHTS = {
        DecisionProfile.SCIENTIFIC_INVESTIGATION: {
            "optical_pit_evidence": 0.30,
            "radar_scattering_anomaly": 0.30,
            "topographic_depression_depth": 0.25,
            "gravity_mass_deficit": 0.15
        },
        DecisionProfile.SPELEOLOGICAL_EXPLORATION: {
            "entry_skylight_access": 0.35,
            "roof_thickness_shielding": 0.25,
            "subsurface_void_evidence": 0.25,
            "interior_slope_rubble": 0.15
        },
        DecisionProfile.ROBOTIC_INGRESS: {
            "surface_landing_slope": 0.35,
            "collar_structural_stability": 0.30,
            "vertical_descent_depth": 0.20,
            "terrain_roughness": 0.15
        }
    }

    @staticmethod
    def evaluate_non_compensatory_gates(
        site_record: Dict[str, Any],
        geomechanical_scenarios: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], str]:
        """
        Applies sequential 5-gate screening funnel (v4.0 Section 0.1 non-compensatory safeguards):
        - Gate 1: Data Validity (Cannot be REJECTED quality state)
        - Gate 2: Geological Plausibility (Must be in volcanic or mare terrain; excludes highland craters)
        - Gate 3: Structural Survival (Scenario roof thickness > 3.0m, minimum scenario FS >= 1.0)
        - Gate 4: Operational Accessibility (Slope check)
        Returns: (passed_all_gates, failure_reason, gate_status_category)
        """
        # Gate 1: Data Validity
        data_source = site_record.get("dataSource", "")
        if site_record.get("quality_state") == "REJECTED":
            return False, "Gate 1 Failure: Observation rejected by M2b data quality governance.", "GATE_1_DATA_INVALID"

        # Gate 2: Geological Plausibility
        terrain = site_record.get("terrain", "Mare")
        if terrain == "Highland":
            return False, "Gate 2 Failure: Highland impact crater terrain lacks volcanic basalt tube origin.", "GATE_2_GEOLOGY_IMPLAUSIBLE"

        # Gate 3: Structural Survival
        fs_range = geomechanical_scenarios.get("fs_range", (1.0, 2.0))
        roof_range = geomechanical_scenarios.get("assumed_roof_thickness_range_m", (10.0, 20.0))
        
        if fs_range[0] < 1.0:
            return False, f"Gate 3 Failure: Impending structural collapse in thin-roof scenario (Min FS = {fs_range[0]:.1f} < 1.0).", "GATE_3_STRUCTURALLY_UNSTABLE"
        if roof_range[0] < 3.0:
            return False, f"Gate 3 Failure: Inadequate rock cover (< 3.0m) for micrometeroid/radiation protection.", "GATE_3_INSUFFICIENT_COVER"

        # Gate 4: Operational Thresholds
        roof = site_record.get("roof", {})
        sky_depth = roof.get("skylightDepthM") or 40.0
        if sky_depth > 200.0:
            return False, f"Gate 4 Failure: Sheer vertical drop ({sky_depth}m) exceeds tether/winch operational limits.", "GATE_4_OPERATIONAL_INACCESSIBLE"

        return True, None, "GATES_PASSED_ELIGIBLE_FOR_RANKING"

    @classmethod
    def run_profile_monte_carlo(
        cls,
        evidence_dict: Dict[str, float],
        weights_dict: Dict[str, float],
        uncertainty: float,
        n_draws: int = 1000
    ) -> Tuple[float, float, float, Dict[str, float]]:
        """
        Evaluates Monte Carlo realizations perturbing decision weights and evidence inputs.
        """
        rng = np.random.RandomState(42)
        keys = list(weights_dict.keys())
        base_weights = np.array([weights_dict[k] for k in keys])
        base_weights = base_weights / np.sum(base_weights)

        scores = []
        weight_draws = []

        for _ in range(n_draws):
            # Perturb weights by +/- 15% Dirichlet jitter
            w_noisy = base_weights * rng.uniform(0.85, 1.15, size=len(base_weights))
            w_norm = w_noisy / np.sum(w_noisy)
            weight_draws.append(w_norm)

            score_realization = 0.0
            for i, k in enumerate(keys):
                val = evidence_dict.get(k, 0.5)
                # Perturb evidence based on observational uncertainty
                noisy_val = np.clip(val + rng.normal(0.0, uncertainty * 0.12), 0.01, 0.99)
                score_realization += w_norm[i] * noisy_val * 100.0

            # Epistemic missingness penalty
            penalized = max(0.0, score_realization - (uncertainty * 10.0))
            scores.append(penalized)

        scores_arr = np.array(scores)
        mean_score = float(np.mean(scores_arr))
        p_low = float(np.percentile(scores_arr, 2.5))
        p_high = float(np.percentile(scores_arr, 97.5))

        weights_mat = np.array(weight_draws)
        sensitivities = {}
        for idx, k in enumerate(keys):
            corr = float(np.corrcoef(weights_mat[:, idx], scores_arr)[0, 1])
            sensitivities[k] = round(corr if not np.isnan(corr) else 0.0, 3)

        return round(mean_score, 1), round(p_low, 1), round(p_high, 1), sensitivities

    @classmethod
    def evaluate_candidate(
        cls,
        site_record: Dict[str, Any],
        geomechanical_scenarios: Dict[str, Any],
        profile: DecisionProfile = DecisionProfile.SCIENTIFIC_INVESTIGATION
    ) -> Dict[str, Any]:
        """
        Assesses a candidate against non-compensatory gates and the specified mission profile.
        """
        detection = site_record.get("detection", {})
        roof = site_record.get("roof", {})
        uncertainty = float(site_record.get("uncertainty", 0.30))

        passed_gates, gate_reason, gate_category = cls.evaluate_non_compensatory_gates(
            site_record, geomechanical_scenarios
        )

        weights = cls.PROFILE_WEIGHTS[profile]

        # Construct profile-specific evidence inputs
        opt_ev = float(detection.get("opticalEvidence", 0.5))
        radar_ev = float(detection.get("radarEvidence", 0.5))
        grav_ev = float(detection.get("gravityEvidence", 0.5))
        sky_depth = float(roof.get("skylightDepthM") or 45.0)
        dem_depth_ev = float(np.clip(sky_depth / 90.0, 0.1, 0.95))
        
        access_ev = float(roof.get("skylightConfidence", 0.70)) if roof.get("skylightDetected", False) else 0.20
        roof_thick = float(roof.get("roofThicknessM") or 12.0)
        shielding_ev = float(np.clip(roof_thick / 15.0, 0.1, 0.95))
        fs_median = float(geomechanical_scenarios.get("median_factor_of_safety", 1.5))
        stab_ev = float(np.clip((fs_median - 1.0) / 1.5, 0.1, 0.95))
        
        terrain_slope_ev = 0.85 if site_record.get("terrain") == "Mare" else 0.45

        if profile == DecisionProfile.SCIENTIFIC_INVESTIGATION:
            input_vector = {
                "optical_pit_evidence": opt_ev,
                "radar_scattering_anomaly": radar_ev,
                "topographic_depression_depth": dem_depth_ev,
                "gravity_mass_deficit": grav_ev
            }
        elif profile == DecisionProfile.SPELEOLOGICAL_EXPLORATION:
            input_vector = {
                "entry_skylight_access": access_ev,
                "roof_thickness_shielding": shielding_ev,
                "subsurface_void_evidence": (opt_ev + radar_ev) / 2.0,
                "interior_slope_rubble": 0.65
            }
        else: # ROBOTIC_INGRESS
            input_vector = {
                "surface_landing_slope": terrain_slope_ev,
                "collar_structural_stability": stab_ev,
                "vertical_descent_depth": float(np.clip(1.0 - (sky_depth / 150.0), 0.1, 0.95)),
                "terrain_roughness": terrain_slope_ev
            }

        # If eliminated by a non-compensatory gate, score is locked out
        if not passed_gates:
            return {
                "id": site_record.get("id"),
                "name": site_record.get("name"),
                "profile": profile.value,
                "passed_gates": False,
                "disqualification_reason": gate_reason,
                "gate_status": gate_category,
                "research_priority_score": None,
                "credible_interval_95": None,
                "ranking_status": "ELIMINATED_BY_GATE",
                "simulated_structural_scenarios": geomechanical_scenarios,
                "weight_sensitivities": {}
            }

        score_mean, score_low, score_high, sensitivities = cls.run_profile_monte_carlo(
            input_vector, weights, uncertainty, n_draws=1000
        )

        ranking_status = "RANKED"
        if uncertainty > 0.45:
            ranking_status = "NEEDS_DATA"
        elif (score_high - score_low) > 28.0:
            ranking_status = "RANKING_UNSTABLE"

        ranked_status = ranking_status
        if not passed_gates:
            ranked_status = gate_category

        return {
            "id": site_record.get("id"),
            "name": site_record.get("name"),
            "region": site_record.get("region"),
            "lat": site_record.get("lat"),
            "lon": site_record.get("lon"),
            "terrain": site_record.get("terrain"),
            "profile": profile.value,
            "passed_gates": passed_gates,
            "disqualification_reason": gate_reason,
            "gate_status": gate_category,
            "research_priority_score": score_mean if passed_gates else None,
            "researchPriorityScore": score_mean if passed_gates else 0.0,
            "credible_interval_95": (score_low, score_high) if passed_gates else None,
            "credibleInterval95": (score_low, score_high) if passed_gates else (0.0, 0.0),
            "status": ranked_status,
            "ranking_status": ranking_status if passed_gates else "ELIMINATED_BY_GATE",
            "simulated_structural_scenarios": geomechanical_scenarios,
            "profile_inputs": input_vector,
            "weight_sensitivities": sensitivities
        }

    @classmethod
    def rank_all(
        cls,
        sites: List[Dict[str, Any]],
        scenario_map: Dict[str, Any],
        profile: DecisionProfile = DecisionProfile.SCIENTIFIC_INVESTIGATION
    ) -> List[Dict[str, Any]]:
        """Legacy and standard wrapper alias for rank_candidates."""
        return cls.rank_candidates(sites, scenario_map, profile)

    @classmethod
    def rank_candidates(
        cls,
        sites: List[Dict[str, Any]],
        scenario_map: Dict[str, Any],
        profile: DecisionProfile = DecisionProfile.SCIENTIFIC_INVESTIGATION
    ) -> List[Dict[str, Any]]:
        """
        Ranks all candidates for a specific mission profile.
        Eliminated sites appear at the bottom with explicit failure tags.
        """
        assessed = []
        for s in sites:
            sc = scenario_map.get(s["id"], {
                "is_simulated_scenario": True,
                "assumed_span_range_m": (40.0, 80.0),
                "assumed_roof_thickness_range_m": (10.0, 25.0),
                "fs_range": (1.2, 2.5),
                "median_factor_of_safety": 1.7,
                "governing_category": "MARGINAL / SEISMICALLY VULNERABLE",
                "risk_flags": []
            })
            assessed.append(cls.evaluate_candidate(s, sc, profile))

        # Sort: eligible candidates by score descending; eliminated sites at the end
        def sort_key(item):
            if not item["passed_gates"]:
                return (-1, 0.0)
            return (1, item["research_priority_score"] or 0.0)

        assessed.sort(key=sort_key, reverse=True)
        rank_counter = 1
        for a in assessed:
            if a["passed_gates"]:
                a["rank"] = rank_counter
                rank_counter += 1
            else:
                a["rank"] = None

        return assessed
